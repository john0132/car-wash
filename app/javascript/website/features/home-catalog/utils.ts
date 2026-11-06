const money = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 2,
})

export const formatMoney = (value: number) => money.format(value)
