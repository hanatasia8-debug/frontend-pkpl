/**
 * "Artikel Potensi" — renders `VillagePotential.description` (paragraphs
 * split on blank lines). The prototype includes a pull-quote block
 * attributed to "Kepala Desa Pringgodani", but the schema has no field for
 * that kind of structured quote — inventing one would be fabricated
 * content, so this only renders what the record actually has.
 */
export function PotensiArticleSection({
  description,
}: {
  description: string;
}) {
  const paragraphs = description.split(/\n\s*\n/).filter(Boolean);

  return (
    <section>
      <h2 className="font-headline-lg text-headline-lg text-primary border-primary relative mb-8 border-b-0 pb-3">
        Artikel Potensi
        <span className="bg-primary-container absolute bottom-0 left-0 h-[3px] w-12" />
      </h2>
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="font-body-base text-body-base text-on-surface-variant leading-relaxed"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
