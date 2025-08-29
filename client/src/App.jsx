import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto w-full">
      <AppRoutes />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
