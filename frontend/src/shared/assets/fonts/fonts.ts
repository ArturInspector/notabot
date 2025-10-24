import localFont from 'next/font/local'

const IBMP = localFont({
  src: [
    { path: './IBMPlexSans-Light.ttf',    weight: '300', style: 'normal' },
    { path: './IBMPlexSans-Regular.ttf',  weight: '400', style: 'normal' },
    { path: './IBMPlexSans-Medium.ttf',   weight: '500', style: 'normal' },
    { path: './IBMPlexSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: './IBMPlexSans-Bold.ttf',     weight: '700', style: 'normal' },
  ],
})

export { IBMP }
