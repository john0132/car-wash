/** An uploaded image as the server shares it (Website::PublicProps#blob_prop). */
export interface Image {
  url: string
}

/** A service as a card (Website::PublicProps#service_card_props). */
export interface ServiceSummary {
  id: number
  slug: string
  name: string | null
  price: number
  sale_price: number | null
  duration_minutes: number | null
  image: Image | null
  /** Only where the card shows its category (the homepage). */
  category?: string | null
}
