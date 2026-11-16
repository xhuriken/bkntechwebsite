import React, { useMemo, useState } from 'react';
import Button from '../../Button';
import OfferCard from '../../promo/OfferCard';
import { STATUS_LABELS, MODE_LABELS } from '../../../utils/promoFormat';
import { toForm, toPayload, toPreview, slugify } from './campaignForm';

const input = 'w-full mt-1 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/60 disabled:opacity-50';
const VALUE_LABEL = { percent: 'Remise (%)', fixed: 'Remise (€)', free_months: 'Mois offerts' };

/** Un champ : libellé, contrôle, aide facultative. */
const Field = ({ label, hint, className = '', children }) => (
  <label className={`text-xs text-on-surface-variant ${className}`}>
    {label}{children}{hint && <span className="block mt-1 text-[11px] text-on-surface-variant/70">{hint}</span>}
  </label>
);
const Section = ({ title, children }) => (
  <fieldset className="grid sm:grid-cols-2 gap-4 border-t border-white/5 pt-5 first:border-0 first:pt-0">
    <legend className="sm:col-span-2 font-bold uppercase text-xs tracking-wider text-on-surface mb-1">{title}</legend>
    {children}
  </fieldset>
);

/** Éditeur d'une offre (création ou modification), avec l'aperçu public à jour en direct. */
export default function CampaignEditor({ campaign, busy, onSave, onDelete, onCancel }) {
  const [f, setF] = useState(() => toForm(campaign));
  const preview = useMemo(() => toPreview(f, campaign?.codes ?? 0), [f, campaign]);
  const locked = (campaign?.codes ?? 0) > 0; // le serveur refuse aussi de changer le mode
  const set = (key) => (e) => setF((old) => ({ ...old, [key]: e.target.value }));
  const setTitle = (e) => { // propose un lien tant que l'offre est neuve et le lien jamais touché
    const title = e.target.value;
    setF((old) => ({ ...old, title, slug: !campaign && old.slug === slugify(old.title) ? slugify(title) : old.slug }));
  };
  const field = (key, props = {}) => <input className={input} value={f[key]} onChange={set(key)} {...props} />;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] gap-6 items-start">
      <form className="bg-surface-container-low/60 border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col gap-5"
        onSubmit={(e) => { e.preventDefault(); onSave(toPayload(f)); }}>
        <Section title="Contenu vu par le client">
          <Field label="Titre" className="sm:col-span-2">{field('title', { onChange: setTitle, maxLength: 120, placeholder: 'B-Ledger : -50 % pendant 3 mois' })}</Field>
          <Field label="Description" className="sm:col-span-2"><textarea rows={3} maxLength={2000} className={input} value={f.description} onChange={set('description')} /></Field>
          <Field label="Conditions" className="sm:col-span-2"><textarea rows={2} maxLength={2000} className={input} value={f.conditions} onChange={set('conditions')} /></Field>
        </Section>
        <Section title="Remise">
          <Field label="Type">
            <select className={input} value={f.discountType} onChange={set('discountType')}>
              <option value="percent">Pourcentage</option><option value="fixed">Montant fixe</option><option value="free_months">Mois offerts</option>
            </select>
          </Field>
          <Field label={VALUE_LABEL[f.discountType]}>{field('discountValue', { type: 'number', min: 1, step: f.discountType === 'fixed' ? '0.01' : '1', required: true })}</Field>
          {f.discountType !== 'free_months' && (
            <Field label="Pendant (mois)" hint="Vide = remise une seule fois.">{field('discountMonths', { type: 'number', min: 1, max: 36 })}</Field>
          )}
        </Section>
        <Section title="Distribution et limites">
          <Field label="Mode" className="sm:col-span-2" hint={locked ? 'Verrouillé : l’offre a déjà des codes.' : undefined}>
            <select className={input} value={f.mode} onChange={set('mode')} disabled={locked}>
              {Object.entries(MODE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Début" hint="Vide = tout de suite.">{field('startsAt', { type: 'datetime-local' })}</Field>
          <Field label="Fin" hint="Vide = sans fin.">{field('endsAt', { type: 'datetime-local' })}</Field>
          {f.mode !== 'shared' && <>
            <Field label="Nombre de codes maximum" hint="Vide = illimité.">{field('maxCodes', { type: 'number', min: 0 })}</Field>
            <Field label="Utilisations par code" hint="1 = usage unique.">{field('maxUsesPerCode', { type: 'number', min: 1, required: true })}</Field>
            <Field label="Préfixe des codes" hint="Ex. BLEDGER → BLEDGER-7K3M-Q9TX.">{field('codePrefix', { maxLength: 12, required: true, pattern: '[A-Za-z0-9]{2,12}' })}</Field>
          </>}
        </Section>
        <Section title="Gestion interne">
          <Field label="Nom interne" hint="Visible seulement par vous.">{field('name', { maxLength: 120, required: true })}</Field>
          <Field label="Statut">
            <select className={input} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Lien public" className="sm:col-span-2" hint={`bkntech.fr/offre/${f.slug || '…'}`}>
            {field('slug', { required: true, pattern: '[a-z0-9\\-]{3,60}' /* « - » échappé : flag v */, title: 'Minuscules, chiffres et tirets (3 à 60)' })}
          </Field>
        </Section>
        <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
          <Button type="submit" variant="green" disabled={busy}>{campaign ? 'Enregistrer' : 'Créer l’offre'}</Button>
          <Button variant="secondary" onClick={onCancel}>Retour à la liste</Button>
          {campaign && !locked && <Button variant="red-outline" className="sm:ml-auto" onClick={() => onDelete(campaign)}>Supprimer</Button>}
        </div>
      </form>
      <aside className="lg:sticky lg:top-24 flex flex-col gap-3" aria-label="Aperçu public">
        <p className="text-xs uppercase tracking-wider text-on-surface-variant">
          Aperçu public{f.status === 'draft' && ' · brouillon : invisible pour les clients'}
        </p>
        <OfferCard offer={preview} />
      </aside>
    </div>
  );
}
