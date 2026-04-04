import { redirect } from 'next/navigation'

// Billing is managed on the main billing page.
// TODO: Build a dedicated settings/billing sub-page with plan comparison table
// and Stripe Customer Portal integration once Stripe is fully configured.
export default function SettingsBillingPage() {
  redirect('/dashboard/billing')
}
