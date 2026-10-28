
export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-2 flex flex-col gap-1 min-h-full">
      {children}
    </div>
  );
}
