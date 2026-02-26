import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google'

export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-family-serif',
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz'],
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-family-sans',
  weight: ['300', '400', '500', '600'],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-family-mono',
  weight: ['400', '500'],
})
