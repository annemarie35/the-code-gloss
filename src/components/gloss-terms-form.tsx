"use client";

import { useActionState } from "react";

type InitialState = {
  message: string | null;
  error: string | null;
};

async function addGlossTerm() {
  return { message: "Nouveau terme ajouté avec succès", error: null };
}

const initialState: InitialState = {
  message: "",
  error: "",
};

export default function GlossTermsForm() {
  const [state, formAction, isPending] = useActionState(
    addGlossTerm,
    initialState,
  );

  const { message, error } = state;

  return (
    <>
      <h1>Ajouter un nouveau terme</h1>
      <form action={formAction}>
        <input type="text" name="toto" placeholder="Event sourcing..." />
        <button type="submit" disabled={isPending}>
          {" "}
          {isPending ? "Loading" : "Ajouter"}
        </button>
        {error && <div> {error}</div>}
        {message && <div>{message}</div>}
      </form>
    </>
  );
}
