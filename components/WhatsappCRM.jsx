"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Save,
  Send,
  Search,
  Filter,
  X,
  BookTemplateIcon,
  Trash2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const WhatsAppCRM = () => {
  // State management with proper initialization
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Appointment Reminder",
      content:
        "Hi {name}, this is a reminder for your appointment on {date} at {time}.",
    },
    {
      id: 2,
      name: "Follow-up",
      content: "Hi {name}, how are you feeling after your recent visit?",
    },
  ]);

  const [selectedContacts, setSelectedContacts] = useState([]);

  // Mock data - In production, this would come from an API
  const patients = useMemo(
    () => [
      {
        id: 1,
        name: "John Doe",
        phone: "+1234567890",
        lastVisit: "2024-01-15",
        status: "Active",
        age: 35,
      },
      {
        id: 2,
        name: "Jane Smith",
        phone: "+1987654321",
        lastVisit: "2024-02-01",
        status: "New",
        age: 28,
      },
      {
        id: 3,
        name: "Mike Johnson",
        phone: "+1122334455",
        lastVisit: "2024-02-10",
        status: "Inactive",
        age: 45,
      },
    ],
    [],
  );

  // Memoized handlers
  const handleTemplateSelect = useCallback(
    (templateId) => {
      const template = templates.find((t) => t.id === parseInt(templateId));
      if (template) {
        setMessage(template.content);
        setSelectedTemplate(templateId);
      }
    },
    [templates],
  );

  const handleSaveTemplate = useCallback(() => {
    if (!message.trim()) return;

    const newTemplate = {
      id: Date.now(),
      name: `Template ${templates.length + 1}`,
      content: message,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  }, [message, templates.length]);

  const handleDeleteTemplate = useCallback(
    (template) => {
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      if (selectedTemplate === template.id.toString()) {
        setSelectedTemplate("");
        setMessage("");
      }
      setTemplateToDelete(null);
    },
    [selectedTemplate],
  );

  const clearFilters = useCallback(() => {
    setStatusFilter("");
    setAgeFilter("");
    setSearchTerm("");
  }, []);

  // Memoized filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        !searchTerm ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);

      const matchesStatus = !statusFilter || patient.status === statusFilter;

      const matchesAge =
        !ageFilter ||
        (ageFilter === "18-30" && patient.age >= 18 && patient.age <= 30) ||
        (ageFilter === "31-50" && patient.age >= 31 && patient.age <= 50) ||
        (ageFilter === "51+" && patient.age > 50);

      return matchesSearch && matchesStatus && matchesAge;
    });
  }, [patients, searchTerm, statusFilter, ageFilter]);

  const toggleContactSelection = useCallback((contact) => {
    setSelectedContacts((prev) =>
      prev.find((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact],
    );
  }, []);

  // Template Card Component
  const TemplateCard = useCallback(
    ({ template, onSelect, onDelete }) => (
      <div className="group relative p-4 border rounded-xl hover:border-green-500 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white">
        <div onClick={() => onSelect(template.id.toString())}>
          <h3 className="font-medium mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setTemplateToDelete(template);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
    [],
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          WhatsApp Campaign Manager
        </h1>
        <Button className="rounded-xl bg-green-600 hover:bg-green-700 shadow-sm transition-all duration-300">
          <MessageCircle className="h-4 w-4 mr-2" />
          Connect WhatsApp
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Message Composer */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  Message Composer
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleSaveTemplate}
                  disabled={!message.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a template or write a new message" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem
                        key={template.id}
                        value={template.id.toString()}
                      >
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[200px] rounded-xl"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <Video className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BookTemplateIcon className="h-5 w-5 text-green-500" />
                Saved Templates
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleTemplateSelect}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Selection */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  Recipients
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedContacts.length} selected)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "text-gray-500 hover:text-gray-700 transition-colors",
                    showFilters && "bg-gray-100",
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {showFilters && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="space-y-2">
                      <Label>Patient Status</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Age Group</Label>
                      <Select value={ageFilter} onValueChange={setAgeFilter}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          <SelectItem value="18-30">18-30</SelectItem>
                          <SelectItem value="31-50">31-50</SelectItem>
                          <SelectItem value="51+">51+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(statusFilter || ageFilter) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl"
                        onClick={clearFilters}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-all duration-300",
                      selectedContacts.find((c) => c.id === patient.id)
                        ? "bg-green-50 border-green-200 shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100",
                    )}
                    onClick={() => toggleContactSelection(patient)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                            {patient.status}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                            Age: {patient.age}
                          </span>
                        </div>
                      </div>
                      {selectedContacts.find((c) => c.id === patient.id) && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full rounded-xl bg-green-600 hover:bg-green-700 shadow-sm transition-all duration-300"
            disabled={selectedContacts.length === 0 || !message}
          >
            <Send className="h-4 w-4 mr-2" />
            {scheduledDate ? "Schedule Message" : "Send Now"}
          </Button>
        </div>
      </div>

      {/* Delete Template Confirmation Dialog */}
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700"
              onClick={() => handleDeleteTemplate(templateToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhatsAppCRM;
