import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Funnel, EventConditionDefinition } from "@/types/funnel";
import { FunnelApi, formatDate } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { BarChart, Edit, Trash, Calendar, User, Clock, Info, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FunnelDetailsProps {
  funnel: Funnel;
}

export default function FunnelDetails({ funnel }: FunnelDetailsProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await FunnelApi.deleteFunnel(funnel.id!);
      toast.success("Funnel deleted successfully");
      navigate("/funnels");
    } catch (error) {
      console.error("Error deleting funnel:", error);
      toast.error("Failed to delete funnel");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCondition = (condition: EventConditionDefinition, i: number) => {
    return (
      <li key={i} className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">
        <div className="font-medium text-gray-900 flex items-center gap-2 mb-1">
          <span className="text-blue-600">{condition.primaryEvent.type}</span>
          {condition.primaryEvent.occurrence && (
            <Badge variant="outline" className="ml-2">
              {condition.primaryEvent.occurrence.operator} {condition.primaryEvent.occurrence.count} times
              {condition.primaryEvent.occurrence.timeWindow && (
                <span className="ml-1">
                  within {condition.primaryEvent.occurrence.timeWindow.value} {condition.primaryEvent.occurrence.timeWindow.unit}
                </span>
              )}
            </Badge>
          )}
        </div>
        {condition.primaryEvent.properties && condition.primaryEvent.properties.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-500 mb-1">Properties:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {condition.primaryEvent.properties.map((prop, idx) => (
                <div key={idx} className="text-sm bg-white p-2 rounded border">
                  <span className="font-medium">{prop.name}</span>
                  <span className="mx-1 text-gray-400">{prop.operator}</span>
                  <span className="text-blue-600">{prop.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {condition.filters && condition.filters.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-500 mb-1">Filters:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {condition.filters.map((filter, idx) => (
                <div key={idx} className="text-sm bg-white p-2 rounded border">
                  <span className="font-medium">{filter.sourceType}</span>
                  <span className="mx-1 text-gray-400">.</span>
                  <span className="text-blue-600">{filter.propertyName}</span>
                  <span className="mx-1 text-gray-400">{filter.operator}</span>
                  <span className="text-blue-600">{filter.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{funnel.name}</h1>
          <p className="text-gray-500 mt-1">{funnel.description || "No description provided"}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/funnels/${funnel.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button asChild>
            <Link to={`/funnels/${funnel.id}/analysis`} className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              View Analysis
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the funnel
                  and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatDate(funnel.timeframe.from)} to {formatDate(funnel.timeframe.to)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Performed By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{funnel.performedBy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {funnel.updatedAt ? formatDate(funnel.updatedAt) : "Never"}
            </div>
            {funnel.lastCalculatedAt && (
              <div className="text-sm text-gray-500 mt-1">
                Last calculated: {formatDate(funnel.lastCalculatedAt)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funnel Steps */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary" />
          Funnel Steps
        </h2>
        <div className="space-y-4">
          {funnel.steps.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  No steps defined for this funnel
                </div>
              </CardContent>
            </Card>
          ) : (
            funnel.steps.map((step, index) => (
              <Card key={index} className={step.isEnabled ? "" : "opacity-60"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.isEnabled ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-600"
                      }`}>
                        {step.order}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.name}</CardTitle>
                        {!step.isEnabled && (
                          <Badge variant="secondary" className="mt-1">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.isRequired && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Required
                        </Badge>
                      )}
                      {step.splitVariations?.length > 0 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {step.splitVariations.length} Variations
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.entries(step.conditions).length > 0 && (
                    <div className="mt-4 space-y-4">
                      {step.conditions.orEventGroups && step.conditions.orEventGroups.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            OR Groups
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.orEventGroups.map(renderCondition)}
                          </ul>
                        </div>
                      )}
                      {step.conditions.andAlsoEvents && step.conditions.andAlsoEvents.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            AND Events
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.andAlsoEvents.map(renderCondition)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
