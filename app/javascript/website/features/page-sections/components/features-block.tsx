export interface FeatureItem {
  id: string
  icon?: { url: string } | null
  title: string
  text?: string
}

export interface FeaturesData {
  heading?: string
  items: FeatureItem[]
}

export function FeaturesBlock({
  data,
  tone = "white",
  id,
}: {
  data: FeaturesData
  tone?: "white" | "ivory"
  id?: string
}) {
  return (
    <section
      id={id}
      className={
        tone === "white" ? "bg-white px-6 py-24" : "bg-[#F6F1E7] px-6 py-24"
      }
    >
      <div className="mx-auto max-w-6xl">
        {data.heading && (
          <div className="max-w-xl">
            <h2
              style={{ fontFamily: "'Italiana', serif" }}
              className="text-4xl text-[#2B3A32] sm:text-5xl"
            >
              {data.heading}
            </h2>
          </div>
        )}

        <div
          className={`grid gap-6 sm:grid-cols-2 ${data.items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} ${data.heading ? "mt-14" : ""}`}
        >
          {data.items.map((item) => (
            <div
              key={item.id}
              className={
                tone === "white"
                  ? "rounded-3xl border border-[#2B3A32]/10 bg-[#F6F1E7] p-7"
                  : "rounded-3xl border border-[#2B3A32]/10 bg-white p-7"
              }
            >
              {item.icon && (
                <img src={item.icon.url} alt="" className="mb-4 h-10 w-10" />
              )}
              <h3 className="text-lg font-medium text-[#2B3A32]">
                {item.title}
              </h3>
              {item.text && (
                <p className="mt-3 text-sm leading-relaxed text-[#5B6B5E]">
                  {item.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
