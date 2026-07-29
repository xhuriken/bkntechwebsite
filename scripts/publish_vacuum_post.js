import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to parse .env file
function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const payloadArgIndex = args.findIndex(arg => arg === '--payload' || arg === '-p');
  const fileArgIndex = args.findIndex(arg => arg === '--file' || arg === '-f');

  let postData = null;

  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    const filePath = path.resolve(process.cwd(), args[fileArgIndex + 1]);
    if (fs.existsSync(filePath)) {
      postData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
  } else if (payloadArgIndex !== -1 && args[payloadArgIndex + 1]) {
    postData = JSON.parse(args[payloadArgIndex + 1]);
  } else {
    console.error('❌ Usage: node scripts/publish_vacuum_post.js --file <path_to_json> [--dry-run]');
    console.error('   or:    node scripts/publish_vacuum_post.js --payload \'<json_string>\' [--dry-run]');
    process.exit(1);
  }

  const postsJsonPath = path.join(projectRoot, 'api', 'posts.json');
  let posts = [];
  if (fs.existsSync(postsJsonPath)) {
    posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));
  }

  // Calculate next ID
  const maxId = posts.reduce((max, p) => {
    const num = parseInt(p.id, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  const nextId = (maxId + 1).toString();

  const todayStr = new Date().toISOString().split('T')[0];

  // Construct complete Post object
  const newPost = {
    id: nextId,
    category: postData.category || 'gaming',
    type: postData.type || 'Gameplay',
    importance: postData.importance || 'normal',
    date: postData.date || todayStr,
    mediaType: postData.mediaType || 'none',
    mediaUrl: postData.mediaUrl || '',
    gallery: postData.gallery || [],
    slots: postData.slots || [],
    title: {
      fr: postData.title?.fr || postData.title || 'Mise à jour Vacuum',
      en: postData.title?.en || postData.title?.fr || postData.title || 'Vacuum Update'
    },
    description: {
      fr: postData.description?.fr || '',
      en: postData.description?.en || ''
    },
    content: {
      fr: postData.content?.fr || '',
      en: postData.content?.en || ''
    },
    tags: postData.tags || ['Vacuum', 'Devlog'],
    commentsCount: 0
  };

  console.log('\n==================================================');
  console.log(`🚀 VACUUM DEVLOG PUBLISHER ${dryRun ? '[DRY RUN]' : ''}`);
  console.log('==================================================');
  console.log(`📌 Post ID       : ${newPost.id}`);
  console.log(`📌 Date          : ${newPost.date}`);
  console.log(`📌 Title (FR)    : ${newPost.title.fr}`);
  console.log(`📌 Title (EN)    : ${newPost.title.en}`);
  console.log(`📌 Category/Type : ${newPost.category} / ${newPost.type}`);
  console.log(`📌 Tags          : ${newPost.tags.join(', ')}`);
  console.log('--------------------------------------------------');

  if (dryRun) {
    console.log('✨ Dry run complete. No files modified, no Discord post sent.');
    process.exit(0);
  }

  // 1. Update api/posts.json
  posts.unshift(newPost);
  fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log('✅ Successfully updated local api/posts.json!');

  // 1.5 Remote VPS API Sync (HTTPS + Authenticated Header)
  const env = loadEnv();
  const adminPassword = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || 'BknAdmin2026!';
  const remoteApiUrl = process.env.REMOTE_API_URL || 'https://bkntech.fr/api/posts';
  try {
    console.log(`🌐 Sending secure HTTPS request to Remote VPS API (${remoteApiUrl})...`);
    const apiRes = await fetch(remoteApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword
      },
      body: JSON.stringify(newPost)
    });
    if (apiRes.ok) {
      console.log('🔒 ✅ Remote VPS API updated successfully over HTTPS!');
    } else {
      console.warn(`⚠️ Remote API returned status ${apiRes.status}`);
    }
  } catch (apiErr) {
    console.warn('ℹ️ Remote VPS API direct call skipped/failed (will sync via Git push):', apiErr.message);
  }

  // 2. Post to Discord Webhook if available
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL;


  if (discordWebhookUrl && discordWebhookUrl.startsWith('http')) {
    const threadTitle = `[${newPost.type}] ${newPost.title.fr}`;
    const discordPayload = {
      username: 'Vacuum Devlog Bot',
      avatar_url: 'https://bkntech.fr/favicon.ico',
      thread_name: threadTitle.length > 100 ? threadTitle.slice(0, 97) + '...' : threadTitle,
      embeds: [
        {
          title: `🎮 VACUUM DEVLOG | ${newPost.title.fr}`,
          description: newPost.description.fr || (newPost.content.fr ? newPost.content.fr.slice(0, 200) + '...' : ''),
          url: 'https://bkntech.fr/#/devlog',
          color: 0x00f2fe, // Cyan gradient color for Vacuum
          fields: [
            {
              name: '📌 Type',
              value: `\`${newPost.type}\``,
              inline: true
            },
            {
              name: '🏷️ Tags',
              value: newPost.tags && newPost.tags.length > 0 ? newPost.tags.map(t => `\`${t}\``).join(' ') : '`Devlog`',
              inline: true
            },
            {
              name: '📖 Devlog Complet',
              value: '[Voir sur le site BknTech](https://bkntech.fr/#/devlog)',
              inline: false
            }
          ],
          image: newPost.mediaUrl ? { url: newPost.mediaUrl.startsWith('http') ? newPost.mediaUrl : `https://bkntech.fr${newPost.mediaUrl}` } : undefined,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Bkn Tech Portfolio • Vacuum Protocol Devlog',
            icon_url: 'https://bkntech.fr/favicon.ico'
          }
        }
      ]
    };


    try {
      const response = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
      if (response.ok) {
        console.log('✅ Successfully posted to Discord Webhook!');
      } else {
        const text = await response.text();
        console.error(`⚠️ Discord Webhook response error (${response.status}): ${text}`);
      }
    } catch (err) {
      console.error('⚠️ Discord Webhook fetch failed:', err.message);
    }
  } else {
    console.log('ℹ️ DISCORD_WEBHOOK_URL not set in .env. Skipping Discord post.');
    console.log('   (Add DISCORD_WEBHOOK_URL="..." to .env to enable Discord integration)');
  }

  // 3. Git commit & push
  try {
    console.log('📦 Committing and pushing to Git...');
    execSync(`git add "${postsJsonPath}"`, { cwd: projectRoot, stdio: 'inherit' });
    const commitMsg = `feat(devlog): add Vacuum update - ${newPost.title.fr.replace(/"/g, '\\"')}`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: projectRoot, stdio: 'inherit' });
    execSync('git push origin main', { cwd: projectRoot, stdio: 'inherit' });
    console.log('🚀 Successfully pushed devlog update to GitHub main branch!');
  } catch (gitErr) {
    console.error('⚠️ Git push error:', gitErr.message);
  }

  console.log('==================================================');
  console.log('🎉 PUBLICATION COMPLETE!');
  console.log('==================================================\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
