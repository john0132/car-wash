const date = new Intl.DateTimeFormat("en", { dateStyle: "long" })

export const formatDate = (iso: string) => date.format(new Date(iso))
