import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel } from "@/types/funnel";
import { toast } from "sonner";
import FunnelDetails from "@/components/funnel/FunnelDetails";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function FunnelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadFunnel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
      } catch (err) {
        console.error("Error loading funnel:", err);
        setError("Failed to load funnel. It may have been deleted or you don't have access.");
        toast.error("Failed to load funnel details");
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnel();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !funnel) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Funnel Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "This funnel may have been deleted or you entered an invalid ID."}
          </p>
          <Button asChild>
            <Link to="/funnels" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return to Funnels List
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FunnelDetails funnel={funnel} />
    </DashboardLayout>
  );
}
