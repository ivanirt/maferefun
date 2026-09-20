const tratados = [
  {
    title: "Collares",
    body: "El ileke se lleva con respeto. No es adorno: marca un pacto. Aquí se vende hecho, y si lo pides, se consagra.",
  },
  {
    title: "Mazos",
    body: "El mazo es más denso. Conviene pedirlo cuando ya hay camino con el santo, no por moda.",
  },
  {
    title: "Consulta",
    body: "Diloggún, Ifá o misa se piden por escrito. La fecha se confirma después, según el sacerdote.",
  },
];

export default function TratadosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Tratados</h1>
      <p className="mt-4 text-[#6D5E52]">Notas cortas. Sin teatro.</p>
      <div className="mt-10 space-y-8">
        {tratados.map((item) => (
          <article key={item.title}>
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-[#6D5E52]">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
