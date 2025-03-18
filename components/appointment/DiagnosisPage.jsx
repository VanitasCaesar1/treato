import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DiagnosisPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <Accordion type="single" collapsible className="w-full">
          {/* Vitals Section */}
          <AccordionItem value="vitals">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-lg font-semibold">Vitals</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Blood Pressure",
                  "Heart Rate",
                  "Temperature",
                  "Blood Sugar",
                  "Weight",
                  "Height",
                ].map((vital) => (
                  <div key={vital} className="space-y-2">
                    <Label htmlFor={vital.toLowerCase().replace(" ", "-")}>
                      {vital}
                    </Label>
                    <Input
                      id={vital.toLowerCase().replace(" ", "-")}
                      placeholder={`Enter ${vital.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* History Section */}
          <AccordionItem value="history">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-lg font-semibold">History</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medical-history">Medical History</Label>
                  <Input
                    id="medical-history"
                    placeholder="Enter patient's medical history"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family-history">Family History</Label>
                  <Input
                    id="family-history"
                    placeholder="Enter patient's family history"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    placeholder="Enter patient's allergies"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Diagnosis Section */}
          <AccordionItem value="diagnosis">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-lg font-semibold">Diagnosis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Input id="symptoms" placeholder="Enter patient's symptoms" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input id="diagnosis" placeholder="Enter diagnosis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Input id="treatment" placeholder="Enter treatment plan" />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Save Diagnosis
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
