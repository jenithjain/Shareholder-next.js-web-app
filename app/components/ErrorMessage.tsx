interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-center">
      <p>{message}</p>
    </div>
  );
}