import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ lang: string }>;
};

/**
 * Au lycée (Niger), les diplômes (BEPC, BAC) sont délivrés par l'État : l'établissement
 * délivre des attestations de réussite, gérées avec les autres attestations.
 */
export default async function DocumentDiplomasPage(props: Props) {
  const { lang } = await props.params;

  redirect(`/${lang}/admin/documents/certificates`);
}
