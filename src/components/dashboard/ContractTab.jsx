import { useState } from "react";

export default function ContractTab({ contract, onSign }) {
  const [signerName, setSignerName] = useState("");
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState(null);

  if (!contract) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-6">
        <p className="text-sm text-ink-soft">Aucun contrat disponible pour l'instant.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!signerName.trim()) return;
    setSigning(true);
    setError(null);
    try {
      await onSign(signerName.trim());
    } catch (err) {
      setError(err?.data?.detail || "La signature a échoué, réessayez.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="bg-surface border border-line rounded-2xl p-6 max-w-3xl">
      <h2 className="font-medium text-lg text-ink mb-3">Contrat de partenariat</h2>
      <pre className="whitespace-pre-wrap text-sm text-ink-soft bg-cream/60 rounded-xl p-4 mb-4 font-sans">
        {contract.content}
      </pre>

      {contract.status === "signed" ? (
        <p className="text-sm text-coffee-dark">
          Signé par {contract.signed_by_name} le{" "}
          {new Date(contract.signed_at).toLocaleDateString("fr-FR")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Votre nom complet, en signature"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="flex-1 border border-line rounded-full px-4 py-2.5 text-sm outline-none focus:border-ink"
            required
          />
          <button
            type="submit"
            disabled={signing}
            className="rounded-full bg-ink text-cream text-sm font-medium px-6 py-2.5 disabled:opacity-60"
          >
            {signing ? "Signature…" : "Signer le contrat"}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
