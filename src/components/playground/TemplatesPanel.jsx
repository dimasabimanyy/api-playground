"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookTemplate, Download } from "lucide-react";
import {
  REQUEST_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
} from "@/lib/templates";

export default function TemplatesPanel({ onLoadTemplate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleLoadTemplate = (templateId) => {
    const template = REQUEST_TEMPLATES[templateId];
    if (template && onLoadTemplate) {
      onLoadTemplate(template.request);
      setDialogOpen(false);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      PUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      PATCH:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      colors[method] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      Testing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      GitHub:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Data: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Fun: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Authentication:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  };

  const templates = getTemplatesByCategory(selectedCategory);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <BookTemplate className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Request Templates
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose from popular API templates to get started quickly
          </p>
        </DialogHeader>

        <div className="py-4">
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-6 mb-6 h-10 bg-gray-100 dark:bg-gray-800 p-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {TEMPLATE_CATEGORIES.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="overflow-y-auto max-h-[50vh] space-y-3">
                  {getTemplatesByCategory(category).map(
                    ([templateId, template]) => (
                      <Card
                        key={templateId}
                        className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-950"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-sm">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {template.description}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadTemplate(templateId)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Use
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className={getMethodColor(
                                template.request.method
                              )}
                            >
                              {template.request.method}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getCategoryColor(template.category)}
                            >
                              {template.category}
                            </Badge>
                          </div>
                          <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded truncate">
                            {template.request.url}
                          </div>

                          {/* Show additional details */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {Object.keys(template.request.headers).length >
                              0 && (
                              <span>
                                {Object.keys(template.request.headers).length}{" "}
                                headers
                              </span>
                            )}
                            {template.request.body && <span>Has body</span>}
                            {template.request.url.includes("{{") && (
                              <span>Uses variables</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}

                  {getTemplatesByCategory(category).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookTemplate className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No templates in this category yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="border-t pt-4 text-xs text-muted-foreground">
          💡 Tip: Templates with variables like <code>{"{{baseUrl}}"}</code>{" "}
          will use your active environment values
        </div>
      </DialogContent>
    </Dialog>
  );
}
