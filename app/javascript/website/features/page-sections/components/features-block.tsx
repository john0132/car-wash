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
        tone === "white" ? "bg-white px-6 py-24" : "bg-ivory px-6 py-24"
      }
    >
      <div className="mx-auto max-w-6xl">
        {data.heading && (
          <div className="max-w-xl">
            <h2
              dir="auto"
              className="font-display text-pine text-4xl sm:text-5xl"
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
                  ? "border-pine/10 bg-ivory rounded-3xl border p-7"
                  : "border-pine/10 rounded-3xl border bg-white p-7"
              }
            >
              {item.icon && (
                <img src={item.icon.url} alt="" className="mb-4 h-10 w-10" />
              )}
              <h3 dir="auto" className="text-pine text-lg font-medium">
                {item.title}
              </h3>
              {item.text && (
                <p
                  dir="auto"
                  className="text-sage mt-3 text-sm leading-relaxed"
                >
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
