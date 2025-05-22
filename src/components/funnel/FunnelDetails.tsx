import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Funnel, ConditionItem, EventProperty } from "@/types/funnel";
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
import { BarChart, Edit, Trash, Calendar, User, Clock, Info, ArrowRight, CheckCircle2, XCircle, ListOrdered, SlidersHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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

  const renderProperty = (property: EventProperty) => {
    const valueDisplay = Array.isArray(property.value) 
      ? property.value.join(", ")
      : property.value;

    return (
      <div key={property.name} className="text-sm bg-white p-2 rounded border">
        <span className="font-medium">{property.name}</span>
        <span className="mx-1 text-gray-400">{property.operator}</span>
        <span className="text-blue-600">{valueDisplay}</span>
        <span className="ml-2 text-xs text-gray-500">({property.type})</span>
      </div>
    );
  };

  const renderCondition = (condition: ConditionItem, i: number) => {
    return (
      <li key={i} className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">
        <div className="font-medium text-gray-900 flex items-center gap-2 mb-1">
          <span className="text-blue-600">{condition.eventName}</span>
          <Badge variant="outline" className="ml-2">
            {condition.operator} {condition.count} times
          </Badge>
        </div>
        {condition.properties && condition.properties.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-500 mb-1">Properties:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {condition.properties.map(renderProperty)}
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
                  {step.conditions && (
                    <div className="mt-4 space-y-4">
                      {/* OR Conditions */}
                      {step.conditions.orEventGroups && step.conditions.orEventGroups.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            OR Conditions
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.orEventGroups.map((condition, i) => renderCondition(condition, i))}
                          </ul>
                        </div>
                      )}

                      {/* AND Conditions */}
                      {step.conditions.andAlsoEvents && step.conditions.andAlsoEvents.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                            AND Conditions
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.andAlsoEvents.map((condition, i) => renderCondition(condition, i))}
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

export function FunnelSetupSummary({ funnel }: { funnel: Funnel }) {
  const renderProperty = (property: EventProperty) => {
    const valueDisplay = Array.isArray(property.value)
      ? property.value.join(", ")
      : property.value;
    return (
      <div key={property.name} className="text-sm bg-white p-2 rounded border">
        <span className="font-medium">{property.name}</span>
        <span className="mx-1 text-gray-400">{property.operator}</span>
        <span className="text-blue-600">{valueDisplay}</span>
        <span className="ml-2 text-xs text-gray-500">({property.type})</span>
      </div>
    );
  };

  const renderCondition = (condition: ConditionItem, i: number) => (
    <li key={i} className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">
      <div className="font-medium text-gray-900 flex items-center gap-2 mb-1">
        <span className="text-blue-600">{condition.eventName}</span>
        <Badge variant="outline" className="ml-2">
          {condition.operator} {condition.count} times
        </Badge>
      </div>
      {condition.properties && condition.properties.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-500 mb-1">Properties:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {condition.properties.map(renderProperty)}
          </div>
        </div>
      )}
    </li>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{funnel.name}</h1>
          <p className="text-gray-500 mt-1">{funnel.description || "No description provided"}</p>
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
                  {step.conditions && (
                    <div className="mt-4 space-y-4">
                      {/* OR Conditions */}
                      {step.conditions.orEventGroups && step.conditions.orEventGroups.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            OR Conditions
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.orEventGroups.map((condition, i) => renderCondition(condition, i))}
                          </ul>
                        </div>
                      )}
                      {/* AND Conditions */}
                      {step.conditions.andAlsoEvents && step.conditions.andAlsoEvents.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                            AND Conditions
                          </div>
                          <ul className="space-y-2">
                            {step.conditions.andAlsoEvents.map((condition, i) => renderCondition(condition, i))}
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

export function FunnelSetupVisualSummary({ funnel }: { funnel: Funnel }) {
  return (
    <TooltipProvider>
      <div className="rounded-xl shadow-lg bg-white border border-gray-200 p-8 relative overflow-hidden">
        {/* Funnel name and description */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 tracking-widest uppercase font-semibold">
              Funnel Name
            </div>
            <Input value={funnel.name} readOnly disabled className="bg-gray-50 font-semibold text-base border border-gray-200" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 tracking-widest uppercase font-semibold">
              Description
            </div>
            <Textarea value={funnel.description} readOnly disabled className="bg-gray-50 min-h-[40px] font-medium border border-gray-200" />
          </div>
        </div>
        <Separator className="my-6" />
        {/* Funnel conditions configuration */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 tracking-widest uppercase font-semibold">
              Time Frame
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-slate-700 font-medium text-xs">
              {funnel.timeframe.from ? new Date(funnel.timeframe.from).toLocaleDateString() : ''} - {funnel.timeframe.to ? new Date(funnel.timeframe.to).toLocaleDateString() : ''}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 tracking-widest uppercase font-semibold">
              Performed By
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-slate-700 font-medium text-xs">
              {funnel.performedBy}
            </span>
          </div>
        </div>
        <Separator className="my-6" />
        {/* Steps */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Steps</span>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
            <div className="flex text-xs text-slate-400 mb-0 gap-8 px-6 pt-4 pb-2 font-semibold tracking-wide">
              <span className="w-12">Order</span>
              <span className="w-16">Enabled</span>
              <span className="w-16">Visible</span>
              <span className="w-16">Optional</span>
              <span className="flex-1">Step Name</span>
            </div>
            <Accordion type="multiple" defaultValue={funnel.steps.map((_, idx) => `step-${idx}`)}>
              {funnel.steps.map((step, idx) => (
                <AccordionItem key={step.id || idx} value={`step-${idx}`} className="border-b last:border-b-0 transition-colors group hover:bg-gray-50">
                  <AccordionTrigger className="px-6 py-3">
                    <div className="flex items-center gap-8 w-full">
                      <span className="w-12 flex items-center justify-center font-bold text-base text-slate-700">{step.order}</span>
                      <span className="w-16 flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`h-2.5 w-2.5 rounded-full ${step.isEnabled ? 'bg-green-400' : 'bg-gray-300'} border border-gray-300`} />
                          </TooltipTrigger>
                          <TooltipContent>{step.isEnabled ? 'Enabled' : 'Disabled'}</TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="w-16 flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-300 border border-gray-300" />
                          </TooltipTrigger>
                          <TooltipContent>Visible</TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="w-16 flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`h-2.5 w-2.5 rounded-full ${!step.isRequired ? 'bg-gray-400' : 'bg-gray-200'} border border-gray-300`} />
                          </TooltipTrigger>
                          <TooltipContent>{!step.isRequired ? 'Optional' : 'Required'}</TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="flex-1 truncate font-medium text-base text-slate-800 group-hover:text-blue-700 transition-colors">{step.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-50 px-6 pb-4 pt-2">
                    {/* Split steps pills */}
                    {step.splitVariations && step.splitVariations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 mt-2">
                        {step.splitVariations.map((split, splitIdx) => (
                          <span key={split.id || splitIdx} className="px-3 py-1 rounded-full border border-blue-200 text-blue-700 text-xs font-semibold bg-white">
                            {split.name || `Split ${splitIdx + 1}`}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Step conditions (summary only) */}
                    <div className="text-xs text-slate-500 mt-2">
                      <div className="font-semibold mb-1">Conditions:</div>
                      {step.conditions?.orEventGroups?.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium text-slate-700">OR:</span>
                          {step.conditions.orEventGroups.map((cond, cidx) => (
                            <span key={cidx} className="ml-2 inline-block border border-slate-200 bg-slate-50 text-slate-700 px-2 py-0.5 rounded">
                              {cond.eventName}
                            </span>
                          ))}
                        </div>
                      )}
                      {step.conditions?.andAlsoEvents?.length > 0 && (
                        <div>
                          <span className="font-medium text-slate-700">AND:</span>
                          {step.conditions.andAlsoEvents.map((cond, cidx) => (
                            <span key={cidx} className="ml-2 inline-block border border-slate-200 bg-slate-50 text-slate-700 px-2 py-0.5 rounded">
                              {cond.eventName}
                            </span>
                          ))}
                        </div>
                      )}
                      {(!step.conditions?.orEventGroups?.length && !step.conditions?.andAlsoEvents?.length) && (
                        <span className="text-gray-300">No conditions</span>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
