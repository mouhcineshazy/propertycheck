export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login and Signup pages have their own full-page layouts
  // Other auth pages (forgot-password, reset-password) will be wrapped by this minimal layout
  return <>{children}</>;
}
