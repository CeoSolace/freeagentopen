export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-sm text-gray-500 dark:text-gray-400">
      © {new Date().getFullYear()} FreeAgentsLTD. All rights reserved.
    </footer>
  );
}
