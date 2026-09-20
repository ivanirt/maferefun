import { patakies } from "@/data/patakies";

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
    body: "IFA Registro u otro tipo se piden por escrito. La fecha se confirma después, según el sacerdote.",
  },
];

export default function TratadosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Tratados</h1>
      <p className="mt-4 text-[#6D5E52]">Notas de la casa. Y patakíes contados de cerca.</p>

      <div className="mt-10 space-y-8">
        {tratados.map((item) => (
          <article key={item.title}>
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-2 text-[#6D5E52]">{item.body}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-16 font-serif text-3xl">Patakíes</h2>
      <p className="mt-3 text-sm text-[#6D5E52]">Diez caminos. Se cuentan al oído.</p>
      <div className="mt-10 space-y-12">
        {patakies.map((item) => (
          <article key={`${item.odu}-${item.title}`}>
            <p className="text-xs uppercase tracking-wider text-[#6D5E52]">{item.odu}</p>
            <h3 className="mt-1 font-serif text-2xl">{item.title}</h3>
            <div className="mt-4 space-y-3 text-[#6D5E52]">
              {item.body.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
