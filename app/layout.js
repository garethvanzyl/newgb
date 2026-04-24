export const metadata = {
  title: 'Gulf Business Newsletter Builder',
  description: 'Create Eloqua-ready newsletters from Gulf Business article links.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
