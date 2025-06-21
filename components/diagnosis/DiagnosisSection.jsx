import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, X, Stethoscope, FileText, Search } from 'lucide-react';

// Types
interface DiagnosisItem {
  id: string;
  condition: string;
  code: string;
  notes: string;
  confidence: 'primary' | 'secondary' | 'rule-out';
  category: string;
}

interface MedicalCondition {
  id: string;
  name: string;
  icd10_codes: string[];
  category: string;
  description: string;
  common_notes: string[];
}

interface ICD10Code {
  code: string;
  description: string;
  category: string;
  notes: string[];
}

interface DiagnosisSectionProps {
  diagnosis_info?: DiagnosisItem[];
  onChange?: (diagnosis_info: DiagnosisItem[]) => void;
}

// Helpers
const generateUniqueId = () => `diagnosis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getConfidenceBadgeStyle = (confidence: string) => ({
  'primary': 'bg-green-100 text-green-800 border-green-200',
  'secondary': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'rule-out': 'bg-red-100 text-red-800 border-red-200'
}[confidence] || 'bg-gray-100 text-gray-800 border-gray-200');

const formatConfidence = (confidence: string | undefined) => 
  confidence ? confidence.charAt(0).toUpperCase() + confidence.slice(1) : 'Primary';

// Character-wise fuzzy search algorithm
const fuzzySearch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
      consecutiveMatches++;
      score += consecutiveMatches * 2; // Bonus for consecutive matches
    } else {
      consecutiveMatches = 0;
    }
  }
  
  // Boost score for complete matches and early matches
  if (queryIndex === queryLower.length) {
    score += 100;
    if (textLower.startsWith(queryLower)) score += 50;
  }
  
  return queryIndex === queryLower.length ? score : 0;
};

// Medical Data
const MEDICAL_CONDITIONS: MedicalCondition[] = [
 {
    id: 'GEN001',
    name: 'Obesity',
    icd10_codes: ['E66.9', 'E66.01', 'E66.09'],
    category: 'General/Metabolic',
    description: 'A complex disease involving an excessive amount of body fat. Obesity isn\'t just a cosmetic concern. It\'s a medical problem that increases your risk of other diseases and health problems.',
    common_notes: [
      'Dietary counseling and meal planning',
      'Regular physical activity, gradually increasing intensity',
      'Behavioral therapy for eating habits',
      'Consider pharmacotherapy or bariatric surgery for severe cases'
    ]
  },
  {
    id: 'GEN002',
    name: 'Chronic Fatigue Syndrome (ME/CFS)',
    icd10_codes: ['G93.3'],
    category: 'General/Neurological',
    description: 'A complex, chronic illness characterized by profound fatigue that doesn\'t improve with rest and may worsen with physical or mental activity.',
    common_notes: [
      'Pacing activities to manage energy levels',
      'Sleep hygiene strategies',
      'Pain and symptom management',
      'Graded exercise therapy (carefully monitored)'
    ]
  },
  {
    id: 'GEN003',
    name: 'Gout',
    icd10_codes: ['M10.9', 'M10.0', 'M10.2'],
    category: 'Musculoskeletal/Metabolic',
    description: 'A form of inflammatory arthritis characterized by sudden, severe attacks of pain, redness, tenderness, and swelling in joints, often the big toe.',
    common_notes: [
      'Acute pain management (NSAIDs, colchicine, corticosteroids)',
      'Dietary modifications (avoid high-purine foods, excessive alcohol)',
      'Increased fluid intake',
      'Long-term management with uric acid-lowering medications (e.g., allopurinol)'
    ]
  },
  {
    id: 'GEN004',
    name: 'Anemia',
    icd10_codes: ['D64.9', 'D50.9', 'D53.9', 'D51.9', 'D52.9'],
    category: 'Hematological',
    description: 'A condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body\'s tissues.',
    common_notes: [
      'Identify and treat underlying cause (iron deficiency, B12 deficiency, folate deficiency)',
      'Nutritional supplementation (iron, B12, folate) if appropriate',
      'Monitoring of blood counts (CBC)',
      'Dietary changes (iron-rich foods, B12 sources)'
    ]
  },
  {
    id: 'GEN005',
    name: 'Vitamin D Deficiency',
    icd10_codes: ['E55.9'],
    category: 'Endocrine/Metabolic',
    description: 'A common condition where the body does not have enough Vitamin D, essential for bone health and other functions.',
    common_notes: [
      'Vitamin D supplementation as prescribed',
      'Increased sun exposure (with precautions)',
      'Dietary intake of Vitamin D rich foods (fatty fish, fortified foods)',
      'Monitoring of Vitamin D levels'
    ]
  },
  {
    id: 'GEN006',
    name: 'Fibromyalgia',
    icd10_codes: ['M79.7'],
    category: 'Musculoskeletal/Neurological',
    description: 'A chronic widespread pain disorder accompanied by fatigue, sleep, memory and mood issues.',
    common_notes: [
      'Multimodal approach including medication, exercise, and therapy',
      'Stress management techniques (relaxation, meditation, yoga)',
      'Good sleep hygiene and regular sleep schedule',
      'Pacing activities to avoid flare-ups and overexertion'
    ]
  },
  {
    id: 'GEN007',
    name: 'Sepsis',
    icd10_codes: ['R65.20', 'R65.21', 'A41.9'],
    category: 'Infectious Disease/Critical Care',
    description: 'A life-threatening condition that arises when the body\'s response to an infection causes injury to its own tissues and organs.',
    common_notes: [
      'Emergency medical attention immediately',
      'Broad-spectrum antibiotics, typically IV',
      'Fluid resuscitation',
      'Monitoring of vital signs and organ function in ICU'
    ]
  },

  // Cardiovascular Conditions
  {
    id: 'CV001',
    name: 'Hypertension (High Blood Pressure)',
    icd10_codes: ['I10', 'I11.0', 'I11.9', 'I12.0', 'I13.0', 'I15.9'],
    category: 'Cardiovascular',
    description: 'A chronic medical condition in which the blood pressure in the arteries is persistently elevated.',
    common_notes: [
      'Regular blood pressure monitoring (daily/weekly)',
      'Lifestyle modifications (DASH diet, regular exercise, sodium restriction, weight management)',
      'Adherence to prescribed medication regimen (ACE inhibitors, ARBs, diuretics, calcium channel blockers)',
      'Follow-up with cardiologist or primary care physician every 3-6 months'
    ]
  },
  {
    id: 'CV002',
    name: 'Coronary Artery Disease (CAD)',
    icd10_codes: ['I25.10', 'I25.11', 'I25.70', 'I25.81', 'I25.5'],
    category: 'Cardiovascular',
    description: 'A condition caused by plaque buildup in the walls of the arteries that supply blood to the heart (coronary arteries) and other parts of the body.',
    common_notes: [
      'Smoking cessation is paramount',
      'Cholesterol management (statins)',
      'Regular exercise and heart-healthy diet (Mediterranean diet)',
      'Stress reduction techniques (meditation, yoga)',
      'Medication adherence (antiplatelets, beta-blockers)'
    ]
  },
  {
    id: 'CV003',
    name: 'Myocardial Infarction (Heart Attack)',
    icd10_codes: ['I21.0', 'I21.1', 'I21.2', 'I21.3', 'I21.4', 'I21.9', 'I22.9'],
    category: 'Cardiovascular',
    description: 'Occurs when blood flow to a part of the heart is blocked for a long enough time that part of the heart muscle is damaged or dies.',
    common_notes: [
      'Emergency medical attention required (call 911/emergency services)',
      'Cardiac rehabilitation program recommended post-stabilization',
      'Strict adherence to prescribed medications (aspirin, beta-blockers, ACE inhibitors, statins)',
      'Lifestyle changes critical for prevention of recurrence and overall heart health'
    ]
  },
  {
    id: 'CV004',
    name: 'Congestive Heart Failure (CHF)',
    icd10_codes: ['I50.9', 'I50.20', 'I50.30', 'I50.40', 'I50.1'],
    category: 'Cardiovascular',
    description: 'A chronic progressive condition that affects the pumping power of your heart muscles.',
    common_notes: [
      'Fluid and sodium restriction (monitor daily weight)',
      'Medication management (diuretics, ACE inhibitors/ARBs, beta-blockers, aldosterone antagonists)',
      'Monitoring for worsening symptoms (dyspnea, peripheral edema, orthopnea)',
      'Regular follow-up with cardiologist, often includes heart failure clinic'
    ]
  },
  {
    id: 'CV005',
    name: 'Atrial Fibrillation',
    icd10_codes: ['I48.91', 'I48.0', 'I48.1', 'I48.2', 'I48.92'],
    category: 'Cardiovascular',
    description: 'An irregular and often rapid heart rate that can increase your risk of strokes, heart failure and other heart-related complications.',
    common_notes: [
      'Anticoagulation therapy to prevent stroke (e.g., warfarin, DOACs)',
      'Rhythm and rate control strategies (medications, cardioversion, ablation)',
      'Monitoring for bleeding complications (if on anticoagulants)',
      'Regular follow-up with cardiologist and INR monitoring if on warfarin'
    ]
  },
  {
    id: 'CV006',
    name: 'Peripheral Artery Disease (PAD)',
    icd10_codes: ['I73.9', 'I70.2', 'I70.21', 'I70.22'],
    category: 'Cardiovascular',
    description: 'A common circulatory problem in which narrowed arteries reduce blood flow to your limbs.',
    common_notes: [
      'Smoking cessation',
      'Regular exercise program (supervised treadmill exercise)',
      'Medication to improve blood flow and reduce risk (antiplatelets, statins)',
      'Foot care education to prevent complications'
    ]
  },
  {
    id: 'CV007',
    name: 'Deep Vein Thrombosis (DVT)',
    icd10_codes: ['I82.409', 'I82.4Z9'],
    category: 'Cardiovascular',
    description: 'A serious condition that occurs when a blood clot forms in a deep vein, usually in the leg.',
    common_notes: [
      'Anticoagulation therapy (blood thinners)',
      'Elevate affected limb',
      'Compression stockings',
      'Monitor for signs of pulmonary embolism (chest pain, shortness of breath)'
    ]
  },
  {
    id: 'CV008',
    name: 'Stroke (Cerebrovascular Accident - CVA)',
    icd10_codes: ['I63.9', 'I63.0', 'I63.1', 'I63.2', 'I63.3', 'I63.4', 'I63.5', 'I63.6', 'I63.8', 'I63.9'],
    category: 'Neurological/Cardiovascular',
    description: 'Occurs when the blood supply to part of your brain is interrupted or reduced, depriving brain tissue of oxygen and nutrients.',
    common_notes: [
      'Emergency medical attention (time-sensitive treatment like tPA if ischemic)',
      'Rehabilitation (physical, occupational, speech therapy) post-stabilization',
      'Management of underlying risk factors (hypertension, diabetes, hyperlipidemia, AFib)',
      'Antiplatelet or anticoagulant therapy to prevent recurrence'
    ]
  },

  // Endocrine Conditions
  {
    id: 'END001',
    name: 'Type 2 Diabetes Mellitus',
    icd10_codes: ['E11.9', 'E11.0', 'E11.2', 'E11.4', 'E11.65', 'E11.5'],
    category: 'Endocrine',
    description: 'A chronic condition that affects the way your body processes blood sugar (glucose).',
    common_notes: [
      'Blood glucose monitoring education (SMBG, CGM)',
      'Dietary counseling (carb control, healthy fats, portion control)',
      'Regular physical activity (at least 150 min moderate-intensity/week)',
      'HbA1c follow-up every 3-6 months, aiming for personalized targets',
      'Annual foot care exam, eye exam, and kidney function monitoring'
    ]
  },
  {
    id: 'END002',
    name: 'Hypothyroidism',
    icd10_codes: ['E03.9', 'E03.0', 'E03.1', 'E03.8', 'E03.2'],
    category: 'Endocrine',
    description: 'A condition in which your thyroid gland doesn\'t produce enough of certain crucial hormones.',
    common_notes: [
      'Lifelong thyroid hormone replacement therapy (levothyroxine)',
      'Regular monitoring of TSH levels (every 6-12 months once stable)',
      'Symptoms improvement (fatigue, weight gain, constipation, cold intolerance)',
      'Take medication on an empty stomach, separate from other medications/supplements'
    ]
  },
  {
    id: 'END003',
    name: 'Hyperthyroidism (e.g., Graves\' Disease)',
    icd10_codes: ['E05.90', 'E05.00', 'E05.10', 'E05.80'],
    category: 'Endocrine',
    description: 'Occurs when your thyroid gland produces too much of the hormone thyroxine, leading to symptoms like weight loss, rapid heartbeat, and anxiety.',
    common_notes: [
      'Antithyroid medications (methimazole, PTU) or other definitive treatment (radioactive iodine, surgery)',
      'Monitoring for symptoms (weight loss, palpitations, anxiety, heat intolerance)',
      'Regular thyroid function tests (TSH, T3, T4)',
      'Beta-blockers for symptom control'
    ]
  },
  {
    id: 'END004',
    name: 'Adrenal Insufficiency (Addison\'s Disease)',
    icd10_codes: ['E27.1', 'E27.49'],
    category: 'Endocrine',
    description: 'A rare disorder that occurs when your body doesn\'t produce enough of certain hormones by your adrenal glands.',
    common_notes: [
      'Lifelong hormone replacement therapy (cortisol, aldosterone)',
      'Emergency plan for adrenal crisis (stress dosing, injectable hydrocortisone)',
      'Medical alert bracelet',
      'Avoidance of stressors if possible'
    ]
  },
  {
    id: 'END005',
    name: 'Polycystic Ovary Syndrome (PCOS)',
    icd10_codes: ['E28.2'],
    category: 'Endocrine/Reproductive (Female)',
    description: 'A hormonal disorder common among women of reproductive age, characterized by irregular periods, excess androgen, and polycystic ovaries.',
    common_notes: [
      'Lifestyle modifications (diet, exercise) for weight management',
      'Hormonal birth control for menstrual regulation',
      'Medications to reduce androgen effects or improve insulin sensitivity (e.g., metformin)',
      'Fertility treatment if conception is desired'
    ]
  },

  // Respiratory Conditions
  {
    id: 'RESP001',
    name: 'Upper Respiratory Tract Infection (URTI)',
    icd10_codes: ['J06.9', 'J00', 'J06.0'],
    category: 'Respiratory',
    description: 'A common viral infection of the nose, throat, pharynx, or larynx (e.g., common cold).',
    common_notes: [
      'Symptomatic treatment (pain relievers, decongestants, cough suppressants)',
      'Adequate rest and hydration',
      'Avoidance of irritants (smoking, strong fumes)',
      'Return if symptoms worsen, develop high fever, or persist beyond 10-14 days'
    ]
  },
  {
    id: 'RESP002',
    name: 'Asthma',
    icd10_codes: ['J45.909', 'J45.20', 'J45.30', 'J45.40', 'J45.50', 'J45.901', 'J45.998'],
    category: 'Respiratory',
    description: 'A chronic inflammatory disease of the airways, causing periodic attacks of wheezing, shortness of breath, chest tightness, and coughing.',
    common_notes: [
      'Asthma action plan education and regular review',
      'Proper inhaler technique demonstration and review',
      'Trigger identification and avoidance (allergens, exercise, cold air)',
      'Regular follow-up for medication adjustment (controller medications, rescue inhalers)'
    ]
  },
  {
    id: 'RESP003',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    icd10_codes: ['J44.9', 'J44.0', 'J44.1', 'J43.9'],
    category: 'Respiratory',
    description: 'A chronic inflammatory lung disease that causes obstructed airflow from the lungs, including emphysema and chronic bronchitis.',
    common_notes: [
      'Smoking cessation is crucial and strongly advised',
      'Pulmonary rehabilitation program',
      'Bronchodilator and corticosteroid inhaler use as prescribed',
      'Annual flu and pneumonia vaccinations recommended',
      'Oxygen therapy if indicated'
    ]
  },
  {
    id: 'RESP004',
    name: 'Pneumonia',
    icd10_codes: ['J18.9', 'J13', 'J15.9', 'J16.8', 'J18.0'],
    category: 'Respiratory',
    description: 'An infection that inflames air sacs in one or both lungs, which may fill with fluid or pus.',
    common_notes: [
      'Antibiotic therapy (if bacterial) or antiviral (if viral)',
      'Rest and hydration are critical for recovery',
      'Monitoring for respiratory distress and worsening symptoms',
      'Follow-up chest X-ray to confirm resolution, especially in older adults/smokers'
    ]
  },
  {
    id: 'RESP005',
    name: 'Bronchitis (Acute)',
    icd10_codes: ['J20.9', 'J20.0', 'J20.8'],
    category: 'Respiratory',
    description: 'Inflammation of the lining of your bronchial tubes, which carry air to and from your lungs, often following a viral infection.',
    common_notes: [
      'Rest and increased fluid intake to thin mucus',
      'Cough suppressants or expectorants if needed (discuss with provider)',
      'Avoidance of irritants (smoking, air pollution)',
      'Return if symptoms persist beyond 3 weeks, worsen with fever, or shortness of breath'
    ]
  },
  {
    id: 'RESP006',
    name: 'Allergic Rhinitis (Hay Fever)',
    icd10_codes: ['J30.1', 'J30.2', 'J30.3', 'J30.4', 'J30.9'],
    category: 'Allergy/Immunology/Respiratory',
    description: 'An allergic reaction to tiny particles in the air, such as pollen, dust mites, or pet dander, causing symptoms like sneezing, runny nose, and itchy eyes.',
    common_notes: [
      'Avoidance of known allergens where possible',
      'Antihistamines (oral or nasal spray)',
      'Nasal corticosteroids for persistent symptoms',
      'Saline nasal rinses',
      'Consider allergy testing and immunotherapy (allergy shots)'
    ]
  },

  // Gastrointestinal Conditions
  {
    id: 'GI001',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    icd10_codes: ['K21.9', 'K21.0'],
    category: 'Gastrointestinal',
    description: 'A chronic digestive disease that occurs when stomach acid or, occasionally, stomach content, flows back into your food pipe (esophagus), irritating the lining.',
    common_notes: [
      'Dietary modifications (avoiding trigger foods like spicy, fatty, acidic, caffeine, chocolate)',
      'Elevate head of bed for sleep',
      'Avoid late meals and lying down immediately after eating',
      'Consider PPI (proton pump inhibitor) or H2 blocker therapy as prescribed'
    ]
  },
  {
    id: 'GI002',
    name: 'Irritable Bowel Syndrome (IBS)',
    icd10_codes: ['K58.9', 'K58.0', 'K58.1'],
    category: 'Gastrointestinal',
    description: 'A common disorder that affects the large intestine, causing symptoms like cramping, abdominal pain, bloating, gas, and diarrhea or constipation, often fluctuating.',
    common_notes: [
      'Dietary management (e.g., low FODMAP diet trial)',
      'Stress reduction techniques (mindfulness, meditation, yoga)',
      'Fiber supplementation if constipation-predominant; anti-diarrheals if diarrhea-predominant',
      'Symptom diary to identify personal triggers'
    ]
  },
  {
    id: 'GI003',
    name: 'Gastritis',
    icd10_codes: ['K29.70', 'K29.00', 'K29.10', 'K29.50'],
    category: 'Gastrointestinal',
    description: 'An inflammation, irritation, or erosion of the lining of the stomach.',
    common_notes: [
      'Avoid alcohol, caffeine, NSAIDs (ibuprofen, naproxen), spicy foods',
      'Bland diet recommended, small frequent meals',
      'Antacids or acid suppressants (PPIs, H2 blockers) as prescribed',
      'Testing for H. pylori infection if indicated, and eradication therapy if positive'
    ]
  },
  {
    id: 'GI004',
    name: 'Diverticulitis',
    icd10_codes: ['K57.30', 'K57.20', 'K57.92'],
    category: 'Gastrointestinal',
    description: 'Inflammation or infection of small pouches (diverticula) that can form in the intestines, particularly the colon.',
    common_notes: [
      'Liquid diet during acute flares, gradually advancing to soft foods',
      'Antibiotics if infection is present',
      'Increase fiber intake post-recovery to prevent future episodes',
      'Monitor for complications like perforation or abscess'
    ]
  },
  {
    id: 'GI005',
    name: 'Cholelithiasis (Gallstones)',
    icd10_codes: ['K80.20', 'K80.00', 'K80.10'],
    category: 'Gastrointestinal',
    description: 'Hardened deposits of digestive fluid that can form in your gallbladder, causing pain or complications.',
    common_notes: [
      'Low-fat diet to reduce symptoms',
      'Pain management during attacks',
      'Surgical consultation for cholecystectomy (gallbladder removal) if symptomatic or complicated',
      'Monitoring for signs of obstruction or infection'
    ]
  },
  {
    id: 'GI006',
    name: 'Constipation',
    icd10_codes: ['K59.00', 'K59.09'],
    category: 'Gastrointestinal',
    description: 'Infrequent or difficult bowel movements.',
    common_notes: [
      'Increase dietary fiber intake (fruits, vegetables, whole grains)',
      'Ensure adequate fluid intake (water)',
      'Regular physical activity',
      'Laxatives or stool softeners if lifestyle changes are insufficient'
    ]
  },
  {
    id: 'GI007',
    name: 'Diarrhea',
    icd10_codes: ['R19.7', 'A09'],
    category: 'Gastrointestinal',
    description: 'Frequent, loose, or watery bowel movements.',
    common_notes: [
      'Maintain hydration with fluids and electrolytes',
      'Bland diet (BRAT diet: bananas, rice, applesauce, toast)',
      'Avoid dairy, spicy foods, and excessive fiber temporarily',
      'Antidiarrheal medications (e.g., loperamide) sparingly'
    ]
  },

  // Neurological Conditions
  {
    id: 'NEUR001',
    name: 'Migraine',
    icd10_codes: ['G43.909', 'G43.001', 'G43.101', 'G43.B0', 'G43.E0'],
    category: 'Neurological',
    description: 'A severe type of headache characterized by intense throbbing pain or a pulsing sensation, usually on one side of the head, often accompanied by nausea, vomiting, and extreme sensitivity to light and sound.',
    common_notes: [
      'Trigger identification and avoidance (stress, certain foods, light, smells)',
      'Stress management techniques (relaxation, meditation, biofeedback)',
      'Maintain a headache diary to track patterns and triggers',
      'Acute treatment (triptans, NSAIDs, CGRP inhibitors) and preventive medications if frequent or severe'
    ]
  },
  {
    id: 'NEUR002',
    name: 'Tension Headache',
    icd10_codes: ['G44.209', 'G44.201', 'G44.202'],
    category: 'Neurological',
    description: 'The most common type of headache, characterized by mild to moderate pain that is often described as a tight band around the head or pressure.',
    common_notes: [
      'Over-the-counter pain relievers (acetaminophen, ibuprofen)',
      'Stress reduction and relaxation techniques (massage, warm bath)',
      'Good posture and ergonomics at work/home',
      'Physical therapy or acupuncture for chronic tension'
    ]
  },
  {
    id: 'NEUR003',
    name: 'Epilepsy',
    icd10_codes: ['G40.909', 'G40.309', 'G40.A0', 'G40.B0', 'G40.409'],
    category: 'Neurological',
    description: 'A central nervous system (neurological) disorder in which brain activity becomes abnormal, causing seizures or periods of unusual behavior, sensations, and sometimes loss of awareness.',
    common_notes: [
      'Adherence to anti-seizure medications as prescribed',
      'Avoidance of known seizure triggers (sleep deprivation, alcohol, stress)',
      'Safety precautions during seizures (clear area, turn on side)',
      'Regular follow-up with neurologist for medication adjustment and monitoring'
    ]
  },
  {
    id: 'NEUR004',
    name: 'Parkinson\'s Disease',
    icd10_codes: ['G20'],
    category: 'Neurological',
    description: 'A progressive nervous system disorder that affects movement. Symptoms start gradually, sometimes with a barely noticeable tremor in one hand.',
    common_notes: [
      'Medication management (levodopa, dopamine agonists, MAO-B inhibitors)',
      'Physical therapy for mobility, balance, and gait',
      'Occupational therapy for daily living activities',
      'Speech therapy for communication and swallowing difficulties',
      'Deep brain stimulation (DBS) considered for advanced cases'
    ]
  },
  {
    id: 'NEUR005',
    name: 'Alzheimer\'s Disease',
    icd10_codes: ['G30.9', 'G30.0', 'G30.1'],
    category: 'Neurological',
    description: 'A progressive neurodegenerative disease that causes memory loss and cognitive decline, eventually leading to severe impairment.',
    common_notes: [
      'Medications to manage symptoms (cholinesterase inhibitors, memantine)',
      'Cognitive stimulation and memory exercises',
      'Safe and supportive environment',
      'Caregiver support and education'
    ]
  },
  {
    id: 'NEUR006',
    name: 'Multiple Sclerosis (MS)',
    icd10_codes: ['G35'],
    category: 'Neurological/Autoimmune',
    description: 'A chronic, unpredictable disease of the central nervous system (brain, spinal cord, optic nerves) that disrupts the flow of information within the brain, and between the brain and body.',
    common_notes: [
      'Disease-modifying therapies (DMTs) to slow progression and reduce relapses',
      'Symptomatic treatment for fatigue, spasticity, pain, bladder dysfunction',
      'Physical therapy, occupational therapy, speech therapy',
      'Stress management and healthy lifestyle'
    ]
  },
  {
    id: 'NEUR007',
    name: 'Sciatica',
    icd10_codes: ['M54.30', 'M54.31', 'M54.32'],
    category: 'Neurological/Musculoskeletal',
    description: 'Pain that radiates along the path of the sciatic nerve, which branches from your lower back through your hips and buttocks and down each leg.',
    common_notes: [
      'Pain management (NSAIDs, muscle relaxants)',
      'Physical therapy for stretching and strengthening',
      'Heat or ice application',
      'Avoid prolonged sitting, maintain good posture'
    ]
  },

  // Musculoskeletal Conditions
  {
    id: 'MSK001',
    name: 'Osteoarthritis',
    icd10_codes: ['M19.90', 'M17.0', 'M16.0', 'M15.0', 'M17.1', 'M16.1'],
    category: 'Musculoskeletal',
    description: 'The most common form of arthritis, affecting millions worldwide. It occurs when the protective cartilage on the ends of your bones wears down over time.',
    common_notes: [
      'Pain management (NSAIDs, topical creams, acetaminophen)',
      'Physical therapy for joint strengthening, flexibility, and range of motion',
      'Weight management to reduce stress on load-bearing joints',
      'Low-impact exercises (swimming, cycling, walking)',
      'Joint injections (corticosteroids, hyaluronic acid) or surgery for severe cases'
    ]
  },
  {
    id: 'MSK002',
    name: 'Rheumatoid Arthritis (RA)',
    icd10_codes: ['M05.9', 'M06.9', 'M05.7', 'M06.0'],
    category: 'Musculoskeletal/Autoimmune',
    description: 'A chronic inflammatory disorder that can affect joints and other body systems. It occurs when your immune system mistakenly attacks your own body\'s tissues, leading to painful swelling.',
    common_notes: [
      'Disease-modifying antirheumatic drugs (DMARDs) as prescribed (methotrexate, biologics)',
      'Physical and occupational therapy for joint protection and function',
      'Regular monitoring for disease activity and side effects of medication',
      'Pain and inflammation management (NSAIDs, corticosteroids)'
    ]
  },
  {
    id: 'MSK003',
    name: 'Low Back Pain (Non-specific)',
    icd10_codes: ['M54.5', 'M51.2', 'M54.4'],
    category: 'Musculoskeletal',
    description: 'Common pain or discomfort located in the lumbar region of the spine, often without a specific identifiable cause.',
    common_notes: [
      'Heat or cold therapy for symptom relief',
      'Over-the-counter pain relievers (NSAIDs)',
      'Physical therapy for core strengthening, flexibility, and proper body mechanics',
      'Maintain activity, avoid prolonged bed rest',
      'Ergonomic assessment of work/home environment'
    ]
  },
  {
    id: 'MSK004',
    name: 'Osteoporosis',
    icd10_codes: ['M81.0', 'M81.8', 'M81.9', 'M80.00XA'],
    category: 'Endocrine/Musculoskeletal',
    description: 'A condition that causes bones to become weak and brittle, making them more susceptible to fractures.',
    common_notes: [
      'Calcium and Vitamin D supplementation',
      'Weight-bearing exercises (walking, strength training)',
      'Fall prevention strategies (remove rugs, improve lighting)',
      'Bone density (DEXA) scan monitoring regularly',
      'Bisphosphonates or other bone-building medications as prescribed'
    ]
  },
  {
    id: 'MSK005',
    name: 'Sprain (Ankle)',
    icd10_codes: ['S93.40XA', 'S93.41XA', 'S93.42XA', 'S93.49XA'],
    category: 'Musculoskeletal',
    description: 'An injury to the tough bands of fibrous tissue (ligaments) that connect bones to each other in the ankle.',
    common_notes: [
      'R.I.C.E. protocol (Rest, Ice, Compression, Elevation)',
      'Over-the-counter pain relievers',
      'Physical therapy for strengthening and balance once acute pain subsides',
      'Gradual return to activity'
    ]
  },
  {
    id: 'MSK006',
    name: 'Tendinitis (Shoulder)',
    icd10_codes: ['M75.30', 'M75.50', 'M75.10'],
    category: 'Musculoskeletal',
    description: 'Inflammation of a tendon, often due to overuse or injury, commonly affecting the shoulder, elbow, or knee.',
    common_notes: [
      'Rest and avoid aggravating activities',
      'Ice application for acute inflammation',
      'NSAIDs for pain and inflammation',
      'Physical therapy for eccentric exercises and stretching',
      'Corticosteroid injections can provide temporary relief'
    ]
  },

  // Dermatological Conditions
  {
    id: 'DERM001',
    name: 'Eczema (Atopic Dermatitis)',
    icd10_codes: ['L20.9', 'L20.0', 'L20.89'],
    category: 'Dermatological',
    description: 'A condition that causes dry, itchy, and inflamed skin, often associated with allergies or asthma.',
    common_notes: [
      'Moisturize regularly (emollients, creams, ointments) after bathing',
      'Avoid triggers (harsh soaps, perfumes, certain fabrics, allergens)',
      'Topical corticosteroids or calcineurin inhibitors as prescribed',
      'Short, lukewarm showers/baths with gentle cleansers'
    ]
  },
  {
    id: 'DERM002',
    name: 'Psoriasis',
    icd10_codes: ['L40.9', 'L40.0', 'L40.50', 'L40.8'],
    category: 'Dermatological',
    description: 'A chronic autoimmune disease that causes rapid skin cell turnover, leading to red, itchy, scaly patches (plaques), most commonly on elbows, knees, scalp, and lower back.',
    common_notes: [
      'Topical treatments (corticosteroids, vitamin D analogs, retinoids)',
      'Phototherapy (UV light therapy)',
      'Systemic medications (oral, injectable) for moderate to severe cases',
      'Moisturize skin and avoid scratching'
    ]
  },
  {
    id: 'DERM003',
    name: 'Acne Vulgaris',
    icd10_codes: ['L70.0'],
    category: 'Dermatological',
    description: 'A common skin condition that occurs when hair follicles plug with oil and dead skin cells, causing pimples, blackheads, whiteheads, cysts, or nodules.',
    common_notes: [
      'Regular gentle cleansing of skin twice daily',
      'Topical retinoids, antibiotics, or benzoyl peroxide as prescribed',
      'Avoid picking or squeezing lesions to prevent scarring',
      'Consider oral medications (antibiotics, isotretinoin) or hormonal therapies for severe/persistent cases'
    ]
  },
  {
    id: 'DERM004',
    name: 'Contact Dermatitis',
    icd10_codes: ['L25.9', 'L23.9', 'L24.9', 'L23.0', 'L24.0'],
    category: 'Dermatological',
    description: 'A skin rash caused by direct contact with a certain substance, which can be an irritant or an allergen.',
    common_notes: [
      'Identify and rigorously avoid the offending substance',
      'Topical corticosteroids to reduce inflammation and itching',
      'Cool compresses to soothe irritation',
      'Patch testing may be necessary for identification of allergic triggers'
    ]
  },
  {
    id: 'DERM005',
    name: 'Cellulitis',
    icd10_codes: ['L03.90', 'L03.116', 'L03.011'],
    category: 'Dermatological/Infectious Disease',
    description: 'A common, potentially serious bacterial skin infection that appears as a red, swollen, tender, hot area of skin. It can spread rapidly.',
    common_notes: [
      'Antibiotic therapy (oral or IV depending on severity)',
      'Elevate affected limb to reduce swelling',
      'Pain management',
      'Monitor for spread of redness, fever, or pus formation'
    ]
  },
  {
    id: 'DERM006',
    name: 'Urticaria (Hives)',
    icd10_codes: ['L50.9', 'L50.0'],
    category: 'Dermatological/Allergy',
    description: 'An outbreak of swollen, pale red bumps or wheals on the skin that appear suddenly as a result of the body\'s reaction to certain allergens or for unknown reasons.',
    common_notes: [
      'Antihistamines for symptom relief',
      'Identify and avoid triggers (foods, medications, insect bites, stress)',
      'Cool compresses',
      'Corticosteroids for severe cases'
    ]
  },

  // Urinary Conditions
  {
    id: 'URO001',
    name: 'Urinary Tract Infection (UTI)',
    icd10_codes: ['N39.0', 'N30.00', 'N30.90', 'N30.10', 'N30.20'],
    category: 'Urinary',
    description: 'An infection in any part of your urinary system — your kidneys, ureters, bladder and urethra. Most infections involve the lower urinary tract (bladder and urethra).',
    common_notes: [
      'Antibiotic therapy as prescribed (complete full course)',
      'Increased fluid intake (water, cranberry juice, avoid irritants like caffeine/alcohol)',
      'Pain relief for dysuria (e.g., phenazopyridine)',
      'Follow-up urine culture if recurrent or complicated'
    ]
  },
  {
    id: 'URO002',
    name: 'Kidney Stones (Nephrolithiasis)',
    icd10_codes: ['N20.0', 'N20.1', 'N20.9', 'N20.2'],
    category: 'Urinary',
    description: 'Hard deposits made of minerals and salts that form inside your kidneys and can cause severe pain as they pass through the urinary tract.',
    common_notes: [
      'Increased fluid intake (water) to aid passage',
      'Pain management (NSAIDs, opioids for severe pain)',
      'Dietary modifications based on stone type (e.g., low oxalate, low sodium)',
      'Strain urine to catch stone for analysis',
      'Urology referral for larger stones or complications (lithotripsy, ureteroscopy)'
    ]
  },
  {
    id: 'URO003',
    name: 'Benign Prostatic Hyperplasia (BPH)',
    icd10_codes: ['N40.1', 'N40.0', 'N40.3'],
    category: 'Urinary (Male)',
    description: 'A common condition in aging men that causes the prostate gland to enlarge, leading to bothersome urinary symptoms like frequent urination, urgency, weak stream, and nocturia.',
    common_notes: [
      'Medications (alpha-blockers like tamsulosin, 5-alpha-reductase inhibitors like finasteride)',
      'Avoid bladder irritants (caffeine, alcohol) and excessive fluid intake before bed',
      'Timed voiding schedule',
      'Regular monitoring of prostate health (PSA, DRE) and symptoms',
      'Surgical options for severe symptoms (TURP)'
    ]
  },
  {
    id: 'URO004',
    name: 'Urinary Incontinence',
    icd10_codes: ['N39.498', 'N39.3', 'N39.41', 'N39.46', 'N39.42'],
    category: 'Urinary',
    description: 'The involuntary leakage of urine, which can range from a few drops to complete wetting.',
    common_notes: [
      'Pelvic floor exercises (Kegel exercises)',
      'Bladder training and scheduled voiding',
      'Lifestyle modifications (fluid management, weight loss, avoid bladder irritants)',
      'Medications or surgical options depending on the type and severity of incontinence'
    ]
  },
  {
    id: 'URO005',
    name: 'Chronic Kidney Disease (CKD)',
    icd10_codes: ['N18.9', 'N18.1', 'N18.2', 'N18.3', 'N18.4', 'N18.5', 'N18.6'],
    category: 'Renal',
    description: 'The gradual, irreversible loss of kidney function over time, often progressing through stages.',
    common_notes: [
      'Strict blood pressure control (ACE inhibitors/ARBs)',
      'Diabetes management (if applicable)',
      'Dietary restrictions (sodium, potassium, phosphorus, protein)',
      'Regular monitoring of kidney function (GFR, creatinine, electrolytes)',
      'Referral to nephrologist, preparation for renal replacement therapy (dialysis, transplant) in advanced stages'
    ]
  },

  // Eye/Vision Conditions
  {
    id: 'EYE001',
    name: 'Conjunctivitis (Pink Eye)',
    icd10_codes: ['H10.9', 'H10.1', 'H10.3', 'H10.0'],
    category: 'Eye/Vision',
    description: 'Inflammation or infection of the outer membrane of the eyeball and the inner eyelid (conjunctiva). It can be bacterial, viral, or allergic.',
    common_notes: [
      'Avoid touching/rubbing eyes to prevent spread',
      'Frequent hand washing, avoid sharing towels',
      'Warm or cool compresses for comfort',
      'Antiviral or antibiotic eye drops (if indicated) or antihistamine drops (if allergic)'
    ]
  },
  {
    id: 'EYE002',
    name: 'Cataract',
    icd10_codes: ['H25.9', 'H25.0', 'H25.1', 'H25.81', 'H26.9'],
    category: 'Eye/Vision',
    description: 'A clouding of the normally clear lens of your eye, leading to blurred vision, glare, and difficulty seeing at night.',
    common_notes: [
      'Monitoring of vision changes and symptom progression',
      'Surgical removal and intraocular lens implantation is the definitive treatment when vision significantly impacted',
      'Use of brighter lights and anti-glare lenses can help temporarily'
    ]
  },
  {
    id: 'EYE003',
    name: 'Glaucoma',
    icd10_codes: ['H40.9', 'H40.10', 'H40.20', 'H40.11', 'H40.21'],
    category: 'Eye/Vision',
    description: 'A group of eye conditions that damage the optic nerve, often caused by abnormally high pressure in your eye, leading to irreversible vision loss if untreated.',
    common_notes: [
      'Regular eye pressure monitoring (tonometry)',
      'Eye drops to reduce intraocular pressure (lifelong)',
      'Laser treatment or surgery for pressure control if drops are insufficient',
      'Lifelong management to prevent further vision loss, regular follow-up with ophthalmologist'
    ]
  },
  {
    id: 'EYE004',
    name: 'Diabetic Retinopathy',
    icd10_codes: ['E11.319', 'E11.329', 'E11.349'],
    category: 'Eye/Vision/Endocrine',
    description: 'A diabetes complication that affects eyes. It\'s caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).',
    common_notes: [
      'Strict blood glucose control and blood pressure management',
      'Regular dilated eye exams (annual for diabetics)',
      'Laser treatment (photocoagulation) or injections (anti-VEGF) for severe cases',
      'Early detection is key to preventing severe vision loss'
    ]
  },
  {
    id: 'EYE005',
    name: 'Macular Degeneration (Age-related)',
    icd10_codes: ['H35.31', 'H35.32'],
    category: 'Eye/Vision',
    description: 'A common eye condition and a leading cause of vision loss among people 50 and older. It causes damage to the macula, a small spot near the center of the retina, leading to blurred central vision.',
    common_notes: [
      'Regular eye exams and Amsler grid self-monitoring',
      'Nutritional supplements (AREDS 2 formula) for dry AMD to slow progression',
      'Anti-VEGF injections for wet AMD to preserve vision',
      'Smoking cessation'
    ]
  },

  // Ear/Hearing Conditions
  {
    id: 'ENT001',
    name: 'Otitis Media (Middle Ear Infection)',
    icd10_codes: ['H66.90', 'H66.00', 'H66.4', 'H65.90'],
    category: 'Ear/Hearing',
    description: 'Inflammation of the middle ear, often caused by bacterial or viral infection, common in children.',
    common_notes: [
      'Antibiotic therapy (if bacterial) or watchful waiting (for viral)',
      'Pain management (acetaminophen, ibuprofen)',
      'Monitoring for resolution of symptoms and fluid behind eardrum',
      'Avoid getting water in the ear if eardrum perforated; consider ear tubes for recurrent infections'
    ]
  },
  {
    id: 'ENT002',
    name: 'Tinnitus',
    icd10_codes: ['H93.19', 'H93.11', 'H93.12', 'H93.13'],
    category: 'Ear/Hearing',
    description: 'The perception of noise or ringing in the ears when no external sound is present.',
    common_notes: [
      'Identify and manage underlying causes (e.g., noise exposure, certain medications, TMJ issues)',
      'Sound therapy (white noise generators, masking devices)',
      'Coping strategies and stress reduction techniques',
      'Audiology consultation and potential hearing aid use if associated with hearing loss'
    ]
  },
  {
    id: 'ENT003',
    name: 'Sensorineural Hearing Loss',
    icd10_codes: ['H90.5', 'H90.3', 'H90.4', 'H90.0'],
    category: 'Ear/Hearing',
    description: 'Hearing loss caused by damage to the inner ear (cochlea) or the nerve pathways from the inner ear to the brain, often irreversible.',
    common_notes: [
      'Audiological evaluation to determine degree and type of loss',
      'Consideration of hearing aids or cochlear implants',
      'Hearing rehabilitation and communication strategies',
      'Protection from loud noises to prevent further damage'
    ]
  },
  {
    id: 'ENT004',
    name: 'Vertigo (Benign Paroxysmal Positional Vertigo - BPPV)',
    icd10_codes: ['H81.10', 'H81.11', 'H81.12', 'H81.13'],
    category: 'Ear/Neurological',
    description: 'A sudden sensation that you\'re spinning or that the inside of your head is spinning, often triggered by specific head movements.',
    common_notes: [
      'Epley maneuver or other canalith repositioning procedures',
      'Avoidance of provoking head positions',
      'Vestibular rehabilitation exercises',
      'Rule out other causes of dizziness'
    ]
  },

  // Sleep Disorders
  {
    id: 'SLP001',
    name: 'Insomnia',
    icd10_codes: ['G47.00', 'G47.01', 'G47.09'],
    category: 'Sleep',
    description: 'A common sleep disorder that can make it hard to fall asleep, hard to stay asleep, or cause you to wake up too early and not be able to get back to sleep.',
    common_notes: [
      'Implement strict good sleep hygiene practices (regular schedule, dark/quiet/cool room)',
      'Cognitive Behavioral Therapy for Insomnia (CBT-I) is first-line treatment',
      'Avoid caffeine and alcohol, especially in the afternoon/evening',
      'Consider short-term sleep medications under medical supervision only'
    ]
  },
  {
    id: 'SLP002',
    name: 'Sleep Apnea (Obstructive Sleep Apnea)',
    icd10_codes: ['G47.30', 'G47.33', 'G47.39'],
    category: 'Sleep',
    description: 'A potentially serious sleep disorder in which breathing repeatedly stops and starts during sleep due to temporary blockage of the airway.',
    common_notes: [
      'Sleep study (polysomnography) for definitive diagnosis',
      'CPAP (Continuous Positive Airway Pressure) therapy is primary treatment',
      'Weight loss if overweight/obese',
      'Avoidance of alcohol and sedatives before bed',
      'Oral appliances or surgery for selected cases'
    ]
  },
  {
    id: 'SLP003',
    name: 'Restless Legs Syndrome (RLS)',
    icd10_codes: ['G25.81'],
    category: 'Sleep/Neurological',
    description: 'A condition that causes an uncontrollable urge to move your legs, usually due to an uncomfortable sensation, typically at night or when at rest.',
    common_notes: [
      'Lifestyle changes (exercise, avoid caffeine/alcohol, warm baths)',
      'Iron supplementation if deficient',
      'Medications (dopaminergic agents, gabapentin) for severe symptoms',
      'Leg massage or stretching'
    ]
  },

  // Psychological/Mental Health Conditions
  {
    id: 'PSYCH001',
    name: 'Generalized Anxiety Disorder (GAD)',
    icd10_codes: ['F41.1'],
    category: 'Mental Health',
    description: 'Characterized by persistent and excessive worry about everyday things, often interfering with daily life.',
    common_notes: [
      'Cognitive Behavioral Therapy (CBT)',
      'Mindfulness and relaxation techniques (deep breathing, progressive muscle relaxation)',
      'Regular physical activity',
      'Medication (SSRIs, SNRIs) if severe or persistent'
    ]
  },
  {
    id: 'PSYCH002',
    name: 'Major Depressive Disorder (MDD)',
    icd10_codes: ['F32.9', 'F32.0', 'F32.1', 'F33.0', 'F33.1', 'F33.2', 'F33.40'],
    category: 'Mental Health',
    description: 'A mood disorder that causes a persistent feeling of sadness and loss of interest, significantly impacting daily functioning.',
    common_notes: [
      'Psychotherapy (CBT, interpersonal therapy, psychodynamic therapy)',
      'Antidepressant medication as prescribed (SSRIs, SNRIs, tricyclics)',
      'Support groups and social engagement',
      'Regular physical activity, healthy diet, adequate sleep',
      'Crisis resources if suicidal thoughts present'
    ]
  },
  {
    id: 'PSYCH003',
    name: 'Panic Disorder',
    icd10_codes: ['F41.0'],
    category: 'Mental Health',
    description: 'Characterized by unexpected and repeated episodes of intense fear (panic attacks) accompanied by physical symptoms like heart palpitations, shortness of breath, dizziness, and chest pain.',
    common_notes: [
      'Cognitive Behavioral Therapy (CBT) with exposure therapy',
      'Breathing exercises and relaxation techniques',
      'Medication (antidepressants, benzodiazepines - short-term)',
      'Gradual exposure to feared situations and triggers'
    ]
  },
  {
    id: 'PSYCH004',
    name: 'Obsessive-Compulsive Disorder (OCD)',
    icd10_codes: ['F42.9', 'F42.1', 'F42.2'],
    category: 'Mental Health',
    description: 'A disorder characterized by unreasonable thoughts and fears (obsessions) that lead to repetitive behaviors (compulsions) aimed at reducing anxiety.',
    common_notes: [
      'Exposure and Response Prevention (ERP) therapy',
      'Medication (SSRIs, clomipramine)',
      'Stress management techniques',
      'Support groups and family education'
    ]
  },
  {
    id: 'PSYCH005',
    name: 'Post-Traumatic Stress Disorder (PTSD)',
    icd10_codes: ['F43.10', 'F43.11', 'F43.12'],
    category: 'Mental Health',
    description: 'A disorder that develops in some people who have experienced a shocking, scary, or dangerous event, leading to flashbacks, nightmares, severe anxiety, and uncontrollable thoughts about the event.',
    common_notes: [
      'Trauma-focused psychotherapy (e.g., EMDR, Cognitive Processing Therapy, Prolonged Exposure Therapy)',
      'Medication (antidepressants like SSRIs, prazosin for nightmares)',
      'Stress reduction techniques and grounding exercises',
      'Strong support system and avoidance of triggers where possible'
    ]
  },
  {
    id: 'PSYCH006',
    name: 'Bipolar Disorder',
    icd10_codes: ['F31.9', 'F31.0', 'F31.1', 'F31.2', 'F31.3', 'F31.4', 'F31.5', 'F31.6', 'F31.7', 'F31.81'],
    category: 'Mental Health',
    description: 'A mental health condition that causes extreme mood swings that include emotional highs (mania or hypomania) and lows (depression).',
    common_notes: [
      'Mood stabilizers (lithium, valproate, lamotrigine)',
      'Antipsychotic medications for manic/mixed episodes',
      'Psychotherapy (CBT, family-focused therapy)',
      'Regular sleep schedule and routine'
    ]
  },
  {
    id: 'PSYCH007',
    name: 'Schizophrenia',
    icd10_codes: ['F20.9', 'F20.0', 'F20.1', 'F20.2'],
    category: 'Mental Health',
    description: 'A chronic and severe mental disorder that affects how a person thinks, feels, and behaves. People with schizophrenia may seem to have lost touch with reality.',
    common_notes: [
      'Antipsychotic medications (first-line treatment)',
      'Psychosocial therapies (CBT, social skills training, family education)',
      'Supportive housing and vocational rehabilitation',
      'Regular monitoring for medication side effects'
    ]
  },

  // Infectious Diseases
  {
    id: 'INF001',
    name: 'Influenza (Flu)',
    icd10_codes: ['J11.1', 'J10.1', 'J09.X1'],
    category: 'Infectious Disease',
    description: 'A common viral infection that attacks the respiratory system (nose, throat, lungs), potentially leading to severe complications.',
    common_notes: [
      'Antiviral medications (oseltamivir, zanamivir) if prescribed early (within 48 hours of symptoms)',
      'Rest and hydration',
      'Symptomatic relief (pain relievers, fever reducers, cough suppressants)',
      'Annual flu vaccination recommended for prevention'
    ]
  },
  {
    id: 'INF002',
    name: 'COVID-19',
    icd10_codes: ['U07.1', 'B34.2', 'Z20.822', 'J12.82'],
    category: 'Infectious Disease',
    description: 'A contagious respiratory illness caused by the SARS-CoV-2 virus, ranging from mild to severe, with potential long-term effects.',
    common_notes: [
      'Isolation and contact tracing protocols',
      'Symptomatic care (hydration, fever control)',
      'Monitoring for severe symptoms (shortness of breath, hypoxia) requiring hospitalization',
      'Vaccination and booster doses recommended for prevention and reduced severity'
    ]
  },
  {
    id: 'INF003',
    name: 'Streptococcal Pharyngitis (Strep Throat)',
    icd10_codes: ['J02.0'],
    category: 'Infectious Disease',
    description: 'A bacterial infection that can make your throat feel sore and scratchy, caused by Streptococcus pyogenes.',
    common_notes: [
      'Antibiotic therapy (penicillin, amoxicillin) to prevent complications like rheumatic fever',
      'Complete the full course of antibiotics, even if symptoms improve',
      'Pain relief for sore throat and fever (NSAIDs, acetaminophen)',
      'Avoid sharing utensils and food'
    ]
  },
  {
    id: 'INF004',
    name: 'Pneumonia (Bacterial)',
    icd10_codes: ['J18.9', 'J13', 'J15.9'],
    category: 'Infectious Disease/Respiratory',
    description: 'An infection that inflames air sacs in one or both lungs, which may fill with fluid or pus, commonly caused by bacteria.',
    common_notes: [
      'Antibiotic therapy specific to suspected organism',
      'Rest and hydration',
      'Monitoring for respiratory distress, oxygen saturation',
      'Pneumococcal vaccinations for at-risk groups'
    ]
  },
  {
    id: 'INF005',
    name: 'Urinary Tract Infection (UTI)',
    icd10_codes: ['N39.0', 'N30.00', 'N30.90'],
    category: 'Infectious Disease/Urinary',
    description: 'An infection in any part of your urinary system, commonly the bladder or urethra.',
    common_notes: [
      'Antibiotic therapy as prescribed, complete full course',
      'Increased fluid intake',
      'Pain relief for dysuria',
      'Proper hygiene practices to prevent recurrence'
    ]
  },
  {
    id: 'INF006',
    name: 'Influenza (Flu)',
    icd10_codes: ['J11.1', 'J10.1', 'J09.X1'],
    category: 'Infectious Disease',
    description: 'A common viral infection that attacks the respiratory system (nose, throat, lungs), potentially leading to severe complications.',
    common_notes: [
      'Antiviral medications (oseltamivir, zanamivir) if prescribed early (within 48 hours of symptoms)',
      'Rest and hydration',
      'Symptomatic relief (pain relievers, fever reducers, cough suppressants)',
      'Annual flu vaccination recommended for prevention'
    ]
  },
  {
    id: 'INF007',
    name: 'Human Immunodeficiency Virus (HIV) Infection',
    icd10_codes: ['B24', 'Z21'],
    category: 'Infectious Disease/Immunology',
    description: 'A virus that attacks the body’s immune system. If not treated, it can lead to AIDS (acquired immunodeficiency syndrome).',
    common_notes: [
      'Antiretroviral therapy (ART) - strict adherence is crucial',
      'Regular monitoring of viral load and CD4 count',
      'Prevention of opportunistic infections',
      'Counseling and support services'
    ]
  },
  {
    id: 'INF008',
    name: 'Tuberculosis (TB)',
    icd10_codes: ['A15.9', 'A16.2', 'A15.0'],
    category: 'Infectious Disease/Respiratory',
    description: 'A potentially serious infectious disease that mainly affects your lungs, caused by Mycobacterium tuberculosis.',
    common_notes: [
      'Long-term multi-drug antibiotic regimen (strict adherence is vital)',
      'Isolation measures if active pulmonary TB',
      'Contact tracing and screening',
      'Monitoring for drug side effects and treatment completion'
    ]
  },

  // Reproductive/Genitourinary Conditions (Female)
  {
    id: 'FEM001',
    name: 'Menopause Symptoms',
    icd10_codes: ['N95.1'],
    category: 'Reproductive (Female)',
    description: 'The time in a woman\'s life when menstrual periods permanently stop, typically associated with hot flashes, night sweats, and mood changes.',
    common_notes: [
      'Lifestyle modifications (layering clothes, cool environment, stress reduction)',
      'Hormone Replacement Therapy (HRT) for severe symptoms (discuss risks/benefits)',
      'Non-hormonal medications (SSRIs, SNRIs) for hot flashes',
      'Bone density monitoring (osteoporosis risk)'
    ]
  },
  {
    id: 'FEM002',
    name: 'Vaginitis (Unspecified)',
    icd10_codes: ['N76.0', 'N76.1', 'N76.8', 'N76.89'],
    category: 'Reproductive (Female)',
    description: 'Inflammation of the vagina, often caused by bacterial imbalance, yeast infection, or irritation.',
    common_notes: [
      'Antifungal or antibiotic treatment depending on cause',
      'Avoidance of irritants (scented products, harsh soaps)',
      'Proper hygiene',
      'Wear breathable cotton underwear'
    ]
  },
  {
    id: 'FEM003',
    name: 'Endometriosis',
    icd10_codes: ['N80.9', 'N80.0', 'N80.1'],
    category: 'Reproductive (Female)',
    description: 'A condition in which tissue similar to the lining of the uterus (endometrium) grows outside the uterus.',
    common_notes: [
      'Pain management (NSAIDs, hormonal birth control)',
      'Hormonal therapies to suppress endometrial growth',
      'Surgical removal of endometrial implants',
      'Fertility counseling if conception is desired'
    ]
  },
  {
    id: 'FEM004',
    name: 'Uterine Fibroids',
    icd10_codes: ['D25.9', 'D25.0', 'D25.1'],
    category: 'Reproductive (Female)',
    description: 'Noncancerous growths of the uterus that often appear during childbearing years, causing heavy bleeding, pelvic pain, or pressure.',
    common_notes: [
      'Medications to manage symptoms (pain relievers, hormonal therapy)',
      'Minimally invasive procedures (uterine artery embolization)',
      'Surgical options (myomectomy, hysterectomy) depending on size, symptoms, and fertility desires',
      'Regular monitoring for growth and symptoms'
    ]
  },

  // Reproductive/Genitourinary Conditions (Male)
  {
    id: 'MALE001',
    name: 'Erectile Dysfunction (ED)',
    icd10_codes: ['N52.9', 'N52.1'],
    category: 'Reproductive (Male)',
    description: 'The inability to get and keep an erection firm enough for sex.',
    common_notes: [
      'Address underlying medical conditions (diabetes, heart disease, hypertension)',
      'Lifestyle modifications (diet, exercise, smoking cessation, limit alcohol)',
      'Oral medications (PDE5 inhibitors like sildenafil, tadalafil)',
      'Vacuum erection devices, injections, or penile implants for persistent cases',
      'Psychological counseling if stress/anxiety is a factor'
    ]
  },
  {
    id: 'MALE002',
    name: 'Prostatitis (Unspecified)',
    icd10_codes: ['N41.9', 'N41.0', 'N41.1'],
    category: 'Reproductive (Male)',
    description: 'Inflammation of the prostate gland, often causing pain in the pelvis, groin, or genitals, and urinary symptoms.',
    common_notes: [
      'Antibiotic therapy if bacterial',
      'Alpha-blockers to relax bladder neck muscles',
      'Pain relievers and warm baths for symptom relief',
      'Avoid irritants like caffeine, alcohol, spicy foods'
    ]
  },
  {
    id: 'MALE003',
    name: 'Testicular Torsion',
    icd10_codes: ['N44.0'],
    category: 'Reproductive (Male)/Emergency',
    description: 'A medical emergency where the spermatic cord (which provides blood flow to the testicle) twists, cutting off the blood supply.',
    common_notes: [
      'IMMEDIATE surgical emergency (within hours to save testicle)',
      'Severe acute scrotal pain, swelling, and tenderness',
      'No common notes for ongoing management as it\'s an acute event'
    ]
  },

  // Neurological Conditions (Cont. from NEUR category for more detail)
  {
    id: 'NEUR008',
    name: 'Trigeminal Neuralgia',
    icd10_codes: ['G50.0'],
    category: 'Neurological',
    description: 'A chronic pain condition that affects the trigeminal nerve, which carries sensation from your face to your brain. Causes severe, sudden, shock-like facial pain.',
    common_notes: [
      'Medications (carbamazepine, oxcarbazepine)',
      'Avoidance of triggers (touching face, chewing, cold air)',
      'Surgical options (microvascular decompression, gamma knife radiosurgery) for refractory cases'
    ]
  },
  {
    id: 'NEUR009',
    name: 'Bell\'s Palsy',
    icd10_codes: ['G51.0'],
    category: 'Neurological',
    description: 'A sudden, temporary weakness or paralysis of the facial muscles, making half of the face appear to droop.',
    common_notes: [
      'Corticosteroids (prednisone) initiated early',
      'Antiviral medication (if suspected viral cause)',
      'Eye protection (eye drops, patching) for affected eye',
      'Physical therapy for facial muscle exercises'
    ]
  },

  // Other Specialties
  {
    id: 'HEM001',
    name: 'Thrombocytopenia (Unspecified)',
    icd10_codes: ['D69.6'],
    category: 'Hematological',
    description: 'A condition in which you have a low blood platelet count, essential for blood clotting.',
    common_notes: [
      'Identify and treat underlying cause (medication, infection, autoimmune)',
      'Avoid medications that affect platelets (NSAIDs, aspirin)',
      'Monitor for bleeding (bruising, petechiae, nosebleeds)',
      'Transfusions or specific medications if severe'
    ]
  },
  {
    id: 'RHEUM001',
    name: 'Lupus Erythematosus (Systemic Lupus Erythematosus - SLE)',
    icd10_codes: ['M32.9', 'M32.10', 'M32.11'],
    category: 'Rheumatology/Autoimmune',
    description: 'A chronic autoimmune disease that can affect almost any part of the body, causing inflammation and tissue damage.',
    common_notes: [
      'Immunosuppressive medications (hydroxychloroquine, corticosteroids, biologics)',
      'Avoid sun exposure (photosensitivity)',
      'Regular monitoring of organ involvement (kidneys, joints, skin)',
      'Stress management and healthy lifestyle'
    ]
  },
  {
    id: 'RHEUM002',
    name: 'Sjögren\'s Syndrome',
    icd10_codes: ['M35.00', 'M35.01'],
    category: 'Rheumatology/Autoimmune',
    description: 'A chronic autoimmune disease that primarily affects the glands that produce tears and saliva, leading to dry eyes and dry mouth.',
    common_notes: [
      'Artificial tears and saliva substitutes',
      'Medications to stimulate tear/saliva production (pilocarpine, cevimeline)',
      'Good oral hygiene to prevent dental issues',
      'Systemic immunosuppression for extra-glandular manifestations'
    ]
  },
  {
    id: 'DERM007',
    name: 'Melanoma',
    icd10_codes: ['C43.9', 'C43.51', 'C43.61'],
    category: 'Dermatology/Oncology',
    description: 'The most serious type of skin cancer, developing in the cells that produce melanin.',
    common_notes: [
      'Surgical excision is primary treatment',
      'Regular self-skin exams (ABCDEs of melanoma)',
      'Sun protection (sunscreen, protective clothing, seek shade)',
      'Dermatology follow-up and potential oncology referral for advanced stages'
    ]
  },
  {
    id: 'ENDO006',
    name: 'Metabolic Syndrome',
    icd10_codes: ['E88.81'],
    category: 'Endocrine/Metabolic',
    description: 'A cluster of conditions (increased blood pressure, high blood sugar, excess body fat around the waist, and abnormal cholesterol or triglyceride levels) that occur together, increasing your risk of heart disease, stroke, and type 2 diabetes.',
    common_notes: [
      'Aggressive lifestyle modification (diet, exercise, weight loss)',
      'Management of individual components (hypertension, dyslipidemia, hyperglycemia)',
      'Regular follow-up for risk factor control'
    ]
  },
  {
    id: 'IMMU001',
    name: 'Food Allergy (Unspecified)',
    icd10_codes: ['T78.00XA', 'T78.1XXA'],
    category: 'Allergy/Immunology',
    description: 'An immune system reaction that occurs shortly after eating a certain food, even a tiny amount, causing severe symptoms.',
    common_notes: [
      'Strict avoidance of trigger food(s)',
      'Carry epinephrine auto-injector (EpiPen) if severe reactions (anaphylaxis)',
      'Allergy testing for definitive diagnosis',
      'Educate family/friends/school about allergies'
    ]
  },
  {
    id: 'RHEUM003',
    name: 'Osteomyelitis',
    icd10_codes: ['M86.9', 'M86.1'],
    category: 'Musculoskeletal/Infectious Disease',
    description: 'An infection of the bone, caused by bacteria or fungi, which can be acute or chronic.',
    common_notes: [
      'Prolonged antibiotic therapy (often IV for weeks/months)',
      'Surgical debridement of infected bone',
      'Immobilization of affected limb',
      'Monitoring for resolution of infection markers'
    ]
  },
  {
    id: 'INF009',
    name: 'Candidiasis (Oral Thrush)',
    icd10_codes: ['B37.0'],
    category: 'Infectious Disease/Oral',
    description: 'A fungal infection of the mouth and throat, caused by Candida albicans, common in infants, immunocompromised individuals, or after antibiotic use.',
    common_notes: [
      'Antifungal mouth rinses or oral antifungals',
      'Good oral hygiene',
      'Sterilize bottles/pacifiers for infants',
      'Address underlying immunosuppression if present'
    ]
  },
  {
    id: 'HEM002',
    name: 'Deep Vein Thrombosis (DVT) (Unspecified Site)',
    icd10_codes: ['I82.409', 'I82.4Z9'],
    category: 'Cardiovascular/Hematological',
    description: 'A blood clot in a deep vein, usually in the leg, which can be life-threatening if it travels to the lungs (pulmonary embolism).',
    common_notes: [
      'Anticoagulation therapy (blood thinners) for several months',
      'Elevate affected limb',
      'Compression stockings to reduce swelling',
      'Early mobilization once stable',
      'Monitor for signs of pulmonary embolism (chest pain, shortness of breath)'
    ]
  },
  {
    id: 'HEM003',
    name: 'Pulmonary Embolism (PE)',
    icd10_codes: ['I26.99', 'I26.01'],
    category: 'Cardiovascular/Pulmonary/Emergency',
    description: 'A sudden blockage in a lung artery, usually caused by a blood clot that traveled from a deep vein (DVT) in the leg to the lung.',
    common_notes: [
      'IMMEDIATE medical emergency',
      'Anticoagulation (heparin, then oral blood thinners)',
      'Oxygen therapy',
      'Thrombolytic therapy or embolectomy for massive PE',
      'Identify and manage risk factors for recurrence'
    ]
  },
  {
    id: 'IMMUNO001',
    name: 'Asthma (Allergic)',
    icd10_codes: ['J45.20'],
    category: 'Allergy/Immunology/Respiratory',
    description: 'Asthma triggered by exposure to allergens like pollen, dust mites, or pet dander.',
    common_notes: [
      'Avoidance of known allergens',
      'Antihistamines and nasal corticosteroids in addition to asthma medications',
      'Allergy testing and immunotherapy consideration',
      'Asthma action plan'
    ]
  },
  {
    id: 'NEURO_DEGEN001',
    name: 'Dementia with Lewy Bodies',
    icd10_codes: ['G31.83'],
    category: 'Neurological',
    description: 'A type of progressive dementia that leads to a decline in thinking, reasoning and independent function because of abnormal microscopic deposits that damage brain cells.',
    common_notes: [
      'Medications to manage cognitive and behavioral symptoms (cholinesterase inhibitors)',
      'Caregiver support and education',
      'Avoid certain medications that can worsen symptoms (e.g., some antipsychotics)',
      'Safety precautions for falls and hallucinations'
    ]
  },
  {
    id: 'ENDO_THYROID001',
    name: 'Thyroid Nodules',
    icd10_codes: ['E04.1', 'D44.0'],
    category: 'Endocrine',
    description: 'Lumps that commonly develop in the thyroid gland, often benign, but require evaluation to rule out malignancy.',
    common_notes: [
      'Thyroid ultrasound for characterization',
      'Fine needle aspiration (FNA) biopsy if suspicious features',
      'Regular monitoring for growth or changes',
      'Surgical removal if cancerous or causing symptoms'
    ]
  },
  {
    id: 'NEURO_PAIN001',
    name: 'Migraine with Aura',
    icd10_codes: ['G43.109'],
    category: 'Neurological',
    description: 'Migraine headaches preceded or accompanied by transient neurological symptoms (aura), such as visual disturbances or sensory changes.',
    common_notes: [
      'Same as general migraine management, with specific attention to aura triggers',
      'Aura may serve as a warning for impending headache, allowing for early treatment'
    ]
  },
  {
    id: 'GI_INFLAM001',
    name: 'Crohn\'s Disease',
    icd10_codes: ['K50.90', 'K50.00', 'K50.10'],
    category: 'Gastrointestinal/Autoimmune',
    description: 'A chronic inflammatory bowel disease that can affect any part of the digestive tract from mouth to anus, causing abdominal pain, severe diarrhea, fatigue, weight loss and malnutrition.',
    common_notes: [
      'Anti-inflammatory drugs (aminosalicylates, corticosteroids)',
      'Immunosuppressants and biologics',
      'Nutritional support (dietary modifications, supplements)',
      'Surgical intervention for complications (strictures, fistulas)',
      'Regular monitoring for disease activity and complications'
    ]
  },
  {
    id: 'GI_INFLAM002',
    name: 'Ulcerative Colitis',
    icd10_codes: ['K51.90', 'K51.00', 'K51.20'],
    category: 'Gastrointestinal/Autoimmune',
    description: 'A chronic inflammatory bowel disease that causes long-lasting inflammation and ulcers (sores) in the innermost lining of your large intestine (colon) and rectum.',
    common_notes: [
      'Anti-inflammatory drugs (aminosalicylates, corticosteroids)',
      'Immunosuppressants and biologics',
      'Dietary management during flares',
      'Surgical intervention (colectomy) for severe or refractory cases',
      'Regular colonoscopy for cancer surveillance'
    ]
  },
  {
    id: 'RENAL_INFECT001',
    name: 'Pyelonephritis (Kidney Infection)',
    icd10_codes: ['N10'],
    category: 'Urinary/Infectious Disease',
    description: 'A type of urinary tract infection (UTI) that affects one or both kidneys, usually caused by bacteria traveling up from the bladder.',
    common_notes: [
      'Antibiotic therapy (often IV initially, then oral)',
      'Hydration',
      'Pain management',
      'Monitoring for fever and systemic symptoms',
      'Imaging (ultrasound/CT) to rule out obstruction'
    ]
  },
  {
    id: 'AUTOIMMUNE001',
    name: 'Rheumatoid Arthritis (Juvenile)',
    icd10_codes: ['M08.00'],
    category: 'Rheumatology/Pediatrics/Autoimmune',
    description: 'The most common type of arthritis in children, causing persistent joint pain, swelling, and stiffness.',
    common_notes: [
      'Early diagnosis and treatment to prevent joint damage',
      'DMARDs and biologics specific for pediatric use',
      'Physical and occupational therapy',
      'Regular eye exams for uveitis surveillance'
    ]
  },
  {
    id: 'HEM_ONC001',
    name: 'Lymphoma (Non-Hodgkin)',
    icd10_codes: ['C85.90', 'C83.30'],
    category: 'Hematology/Oncology',
    description: 'A type of cancer that begins in white blood cells called lymphocytes, which are part of the body\'s immune system.',
    common_notes: [
      'Chemotherapy, radiation therapy, immunotherapy',
      'Bone marrow biopsy for staging',
      'Monitoring for signs and symptoms (swollen lymph nodes, fever, night sweats, weight loss)',
      'Regular follow-up for surveillance'
    ]
  },
  {
    id: 'HEM_ONC002',
    name: 'Leukemia (Acute Lymphoblastic)',
    icd10_codes: ['C91.00'],
    category: 'Hematology/Oncology',
    description: 'A cancer of the blood and bone marrow that affects white blood cells, progressing rapidly and creating immature lymphocytes.',
    common_notes: [
      'Intensive chemotherapy',
      'Bone marrow transplant',
      'Supportive care (blood transfusions, infection prevention)',
      'Regular monitoring of blood counts'
    ]
  },
  {
    id: 'CARD_VALVE001',
    name: 'Aortic Stenosis',
    icd10_codes: ['I35.0'],
    category: 'Cardiovascular',
    description: 'Narrowing of the aortic valve opening, which restricts blood flow from the heart to the body.',
    common_notes: [
      'Monitoring of symptoms (chest pain, shortness of breath, dizziness)',
      'Echocardiography for severity assessment',
      'Valve replacement (surgical or TAVR) for severe symptomatic cases',
      'Avoid strenuous physical activity if severe'
    ]
  },
  {
    id: 'CARD_VALVE002',
    name: 'Mitral Regurgitation',
    icd10_codes: ['I34.0'],
    category: 'Cardiovascular',
    description: 'A condition in which the heart\'s mitral valve doesn\'t close tightly, allowing blood to leak backward into the heart.',
    common_notes: [
      'Monitoring for symptoms (fatigue, shortness of breath, palpitations)',
      'Medications to manage heart failure symptoms',
      'Echocardiography for severity and progression',
      'Surgical repair or replacement of the mitral valve if severe'
    ]
  },
  {
    id: 'ENDO_DIABETES001',
    name: 'Diabetic Neuropathy',
    icd10_codes: ['E11.40', 'E11.42', 'E11.49'],
    category: 'Endocrine/Neurological',
    description: 'A type of nerve damage that can occur if you have diabetes, most commonly affecting the legs and feet.',
    common_notes: [
      'Strict blood glucose control to prevent progression',
      'Pain management for neuropathic pain (gabapentin, pregabalin, duloxetine)',
      'Daily foot care and inspection to prevent ulcers',
      'Physical therapy for balance and strength'
    ]
  },
  {
    id: 'ENDO_DIABETES002',
    name: 'Diabetic Nephropathy (Kidney Disease)',
    icd10_codes: ['E11.21', 'E11.22'],
    category: 'Endocrine/Renal',
    description: 'A serious kidney-related complication of type 1 and type 2 diabetes.',
    common_notes: [
      'Strict blood glucose and blood pressure control',
      'ACE inhibitors or ARBs for kidney protection',
      'Low protein diet in advanced stages',
      'Regular monitoring of kidney function and urine albumin-to-creatinine ratio'
    ]
  },
  {
    id: 'GASTRO_INFECT001',
    name: 'Gastroenteritis (Viral)',
    icd10_codes: ['A08.4', 'A08.3'],
    category: 'Gastrointestinal/Infectious Disease',
    description: 'Commonly known as stomach flu, an inflammation of the stomach and intestines caused by a virus, leading to vomiting and diarrhea.',
    common_notes: [
      'Hydration with fluids and electrolytes',
      'Bland diet, gradual reintroduction of food',
      'Rest',
      'Avoid antidiarrheals/antiemetics unless severe (discuss with doctor)'
    ]
  },
  {
    id: 'GASTRO_AUTO001',
    name: 'Celiac Disease',
    icd10_codes: ['K90.0'],
    category: 'Gastrointestinal/Autoimmune',
    description: 'An immune reaction to eating gluten, a protein found in wheat, barley, and rye, leading to damage in the small intestine.',
    common_notes: [
      'Strict lifelong gluten-free diet',
      'Nutritional counseling',
      'Supplementation for nutrient deficiencies (iron, vitamin D, B12)',
      'Regular monitoring for symptoms and complications'
    ]
  },
  {
    id: 'RESP_ALLERGY001',
    name: 'Anaphylaxis (Allergic Reaction, Severe)',
    icd10_codes: ['T78.2XXA', 'T78.2XXD'],
    category: 'Allergy/Immunology/Emergency',
    description: 'A severe, potentially life-threatening allergic reaction that can occur within seconds or minutes of exposure to an allergen.',
    common_notes: [
      'IMMEDIATE administration of epinephrine (EpiPen) is critical',
      'Call emergency services (911/emergency number)',
      'Avoidance of known allergen',
      'Wear medical alert bracelet'
    ]
  },
  {
    id: 'MUSCULO_BACK001',
    name: 'Herniated Disc (Lumbar)',
    icd10_codes: ['M51.26', 'M51.27'],
    category: 'Musculoskeletal/Neurological',
    description: 'A condition where the soft, jelly-like center of a spinal disc pushes through a crack in the tougher exterior, potentially irritating nearby nerves.',
    common_notes: [
      'Pain management (NSAIDs, muscle relaxants, nerve pain medications)',
      'Physical therapy for core strengthening and mobility',
      'Epidural steroid injections for symptom relief',
      'Surgery for severe, persistent symptoms or neurological deficits'
    ]
  },
  {
    id: 'MUSCULO_JOINTS001',
    name: 'Bursitis (Shoulder/Hip)',
    icd10_codes: ['M75.50', 'M70.60'],
    category: 'Musculoskeletal',
    description: 'Inflammation of a bursa, a small fluid-filled sac that acts as a cushion between bones, tendons, muscles, and skin.',
    common_notes: [
      'Rest and avoidance of aggravating activities',
      'Ice application',
      'NSAIDs for pain and inflammation',
      'Physical therapy for strengthening and flexibility',
      'Corticosteroid injections into the bursa'
    ]
  },
  {
    id: 'URINARY_MALE001',
    name: 'Prostate Cancer',
    icd10_codes: ['C61'],
    category: 'Oncology/Urinary (Male)',
    description: 'Cancer that forms in tissues of the prostate gland, a gland in the male reproductive system that produces seminal fluid.',
    common_notes: [
      'Screening (PSA test, DRE) based on guidelines and shared decision-making',
      'Treatment options vary by stage (active surveillance, surgery, radiation, hormonal therapy)',
      'Regular follow-up with urologist/oncologist',
      'Management of treatment side effects (urinary, erectile dysfunction)'
    ]
  },
  {
    id: 'URINARY_FEMALE001',
    name: 'Pelvic Organ Prolapse',
    icd10_codes: ['N81.9', 'N81.1', 'N81.2'],
    category: 'Reproductive (Female)/Urinary',
    description: 'A condition where one or more of the pelvic organs (bladder, uterus, rectum) drop from their normal position and bulge into the vagina.',
    common_notes: [
      'Pelvic floor exercises (Kegels)',
      'Pessary use for support',
      'Lifestyle modifications (weight management, avoid heavy lifting)',
      'Surgical repair for significant symptoms'
    ]
  },
  {
    id: 'PSYCH_SUBSTANCE001',
    name: 'Alcohol Use Disorder (AUD)',
    icd10_codes: ['F10.20', 'F10.10'],
    category: 'Mental Health/Addiction',
    description: 'A chronic relapsing brain disease characterized by an impaired ability to stop or control alcohol use despite adverse social, occupational, or health consequences.',
    common_notes: [
      'Counseling and psychotherapy (CBT, motivational interviewing)',
      'Medications to reduce cravings or prevent relapse (naltrexone, acamprosate, disulfiram)',
      'Support groups (AA)',
      'Detoxification under medical supervision if severe dependence'
    ]
  },
  {
    id: 'PULM_VASC001',
    name: 'Pulmonary Hypertension',
    icd10_codes: ['I27.2', 'I27.0'],
    category: 'Cardiovascular/Respiratory',
    description: 'A type of high blood pressure that affects the arteries in your lungs and the right side of your heart.',
    common_notes: [
      'Specific medications to dilate lung blood vessels',
      'Oxygen therapy',
      'Management of underlying causes (e.g., heart failure, lung disease)',
      'Regular monitoring and specialist care'
    ]
  }
];

const ICD10_CODES: ICD10Code[] = [
   // General & Systemic
  { code: 'E66.9', description: 'Obesity, unspecified', category: 'General/Metabolic', notes: ['General code for obesity'] },
  { code: 'E66.01', description: 'Morbid (severe) obesity with alveolar hypoventilation', category: 'General/Metabolic', notes: ['Severe obesity with breathing difficulty'] },
  { code: 'G93.3', description: 'Postviral fatigue syndrome', category: 'General/Neurological', notes: ['Often used for Chronic Fatigue Syndrome'] },
  { code: 'M10.9', description: 'Gout, unspecified', category: 'Musculoskeletal/Metabolic', notes: ['General gout code'] },
  { code: 'M10.0', description: 'Idiopathic gout', category: 'Musculoskeletal/Metabolic', notes: ['Gout with unknown cause'] },
  { code: 'D64.9', description: 'Anemia, unspecified', category: 'Hematological', notes: ['General anemia'] },
  { code: 'D50.9', description: 'Iron deficiency anemia, unspecified', category: 'Hematological', notes: ['Common type of anemia'] },
  { code: 'E55.9', description: 'Vitamin D deficiency, unspecified', category: 'Endocrine/Metabolic', notes: ['Common vitamin deficiency'] },
  { code: 'M79.7', description: 'Fibromyalgia', category: 'Musculoskeletal/Neurological', notes: ['Chronic widespread pain condition'] },
  { code: 'R65.20', description: 'Severe sepsis without septic shock', category: 'Infectious Disease/Critical Care', notes: ['Life-threatening response to infection'] },
  { code: 'R65.21', description: 'Severe sepsis with septic shock', category: 'Infectious Disease/Critical Care', notes: ['Life-threatening sepsis with dangerously low blood pressure'] },
  { code: 'A41.9', description: 'Sepsis, unspecified organism', category: 'Infectious Disease/Critical Care', notes: ['General sepsis code'] },

  // Cardiovascular
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular', notes: ['Most common type of high blood pressure'] },
  { code: 'I11.0', description: 'Hypertensive heart disease with heart failure', category: 'Cardiovascular', notes: ['Heart damage due to hypertension, with heart failure'] },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Cardiovascular', notes: ['CAD without chest pain'] },
  { code: 'I25.11', description: 'Atherosclerotic heart disease of native coronary artery with angina pectoris', category: 'Cardiovascular', notes: ['CAD with chest pain'] },
  { code: 'I21.9', description: 'Acute myocardial infarction, unspecified', category: 'Cardiovascular', notes: ['General heart attack code'] },
  { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular', notes: ['General heart failure code'] },
  { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiovascular', notes: ['Common irregular heart rhythm'] },
  { code: 'I73.9', description: 'Peripheral vascular disease, unspecified', category: 'Cardiovascular', notes: ['General PAD code'] },
  { code: 'I82.409', description: 'Acute embolism and thrombosis of unspecified deep veins of unspecified lower extremity', category: 'Cardiovascular', notes: ['General DVT code'] },
  { code: 'I63.9', description: 'Cerebral infarction, unspecified', category: 'Neurological/Cardiovascular', notes: ['General stroke code'] },
  { code: 'I26.99', description: 'Other pulmonary embolism without acute cor pulmonale', category: 'Cardiovascular/Pulmonary', notes: ['Blood clot in lung, not causing acute right heart strain'] },
  { code: 'I26.01', description: 'Septic pulmonary embolism with acute cor pulmonale', category: 'Cardiovascular/Pulmonary', notes: ['Infected blood clot in lung, causing acute right heart strain'] },
  { code: 'I35.0', description: 'Nonrheumatic aortic (valve) stenosis', category: 'Cardiovascular', notes: ['Narrowing of aortic valve'] },
  { code: 'I34.0', description: 'Nonrheumatic mitral (valve) insufficiency', category: 'Cardiovascular', notes: ['Leaky mitral valve'] },
  { code: 'I27.2', description: 'Other secondary pulmonary hypertension', category: 'Cardiovascular/Respiratory', notes: ['High blood pressure in lung arteries, secondary cause'] },

  // Endocrine
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', notes: ['Most common diabetes type, no specific complications coded'] },
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine', notes: ['High blood sugar with Type 2 diabetes'] },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Endocrine', notes: ['Underactive thyroid'] },
  { code: 'E05.90', description: 'Thyrotoxicosis, unspecified', category: 'Endocrine', notes: ['Overactive thyroid'] },
  { code: 'E27.1', description: 'Primary adrenal insufficiency', category: 'Endocrine', notes: ['Addison\'s disease'] },
  { code: 'E28.2', description: 'Polycystic ovarian syndrome', category: 'Endocrine/Reproductive (Female)', notes: ['PCOS'] },
  { code: 'E88.81', description: 'Metabolic syndrome', category: 'Endocrine/Metabolic', notes: ['Cluster of risk factors'] },
  { code: 'E04.1', description: 'Nontoxic single thyroid nodule', category: 'Endocrine', notes: ['Single benign thyroid lump'] },
  { code: 'D44.0', description: 'Neoplasm of uncertain behavior of thyroid gland', category: 'Endocrine', notes: ['Thyroid nodule that needs further investigation for cancer'] },
  { code: 'E11.40', description: 'Type 2 diabetes mellitus with neurological complications, unspecified', category: 'Endocrine/Neurological', notes: ['General diabetic neuropathy'] },
  { code: 'E11.21', description: 'Type 2 diabetes mellitus with diabetic nephropathy', category: 'Endocrine/Renal', notes: ['Kidney disease due to diabetes'] },


  // Respiratory
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory', notes: ['Common cold, general'] },
  { code: 'J00', description: 'Acute nasopharyngitis [common cold]', category: 'Respiratory', notes: ['Common cold, specific'] },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory', notes: ['General asthma code'] },
  { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified', category: 'Respiratory', notes: ['General COPD code'] },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Respiratory', notes: ['General pneumonia code'] },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory', notes: ['General acute bronchitis'] },
  { code: 'J30.9', description: 'Allergic rhinitis, unspecified', category: 'Allergy/Immunology/Respiratory', notes: ['General hay fever'] },
  { code: 'J45.20', description: 'Mild intermittent allergic asthma, uncomplicated', category: 'Allergy/Immunology/Respiratory', notes: ['Asthma with allergic component'] },

  // Gastrointestinal
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal', notes: ['Acid reflux without esophageal inflammation'] },
  { code: 'K58.9', description: 'Irritable bowel syndrome without diarrhea', category: 'Gastrointestinal', notes: ['IBS, non-diarrhea type'] },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal', notes: ['Stomach inflammation, no bleeding'] },
  { code: 'K57.30', description: 'Diverticulosis of large intestine without perforation or abscess', category: 'Gastrointestinal', notes: ['Pouches in intestine without complications'] },
  { code: 'K80.20', description: 'Calculus of gallbladder without cholecystitis, without obstruction', category: 'Gastrointestinal', notes: ['Gallstones without inflammation or blockage'] },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Gastrointestinal', notes: ['General constipation'] },
  { code: 'R19.7', description: 'Diarrhea, unspecified', category: 'Gastrointestinal', notes: ['General diarrhea'] },
  { code: 'A08.4', description: 'Other viral intestinal infection', category: 'Gastrointestinal/Infectious Disease', notes: ['General viral gastroenteritis'] },
  { code: 'K90.0', description: 'Celiac disease', category: 'Gastrointestinal/Autoimmune', notes: ['Gluten intolerance'] },
  { code: 'K50.90', description: 'Crohn\'s disease, unspecified, without complications', category: 'Gastrointestinal/Autoimmune', notes: ['General Crohn\'s disease'] },
  { code: 'K51.90', description: 'Ulcerative colitis, unspecified, without complications', category: 'Gastrointestinal/Autoimmune', notes: ['General Ulcerative Colitis'] },

  // Neurological
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Neurological', notes: ['General migraine code'] },
  { code: 'G44.209', description: 'Unspecified tension-type headache, not intractable', category: 'Neurological', notes: ['General tension headache'] },
  { code: 'G40.909', description: 'Epilepsy, unspecified, not intractable, without status epilepticus', category: 'Neurological', notes: ['General epilepsy code'] },
  { code: 'G20', description: 'Parkinson\'s disease', category: 'Neurological', notes: ['Neurodegenerative movement disorder'] },
  { code: 'G30.9', description: 'Alzheimer\'s disease, unspecified', category: 'Neurological', notes: ['General Alzheimer\'s'] },
  { code: 'G35', description: 'Multiple sclerosis', category: 'Neurological/Autoimmune', notes: ['MS'] },
  { code: 'M54.30', description: 'Sciatica, unspecified side', category: 'Neurological/Musculoskeletal', notes: ['General sciatica'] },
  { code: 'G50.0', description: 'Trigeminal neuralgia', category: 'Neurological', notes: ['Facial nerve pain'] },
  { code: 'G51.0', description: 'Bell\'s palsy', category: 'Neurological', notes: ['Facial paralysis'] },
  { code: 'G31.83', description: 'Dementia with Lewy bodies', category: 'Neurological', notes: ['Specific type of dementia'] },
  { code: 'G43.109', description: 'Migraine with aura, not intractable, without status migrainosus', category: 'Neurological', notes: ['Migraine with preceding symptoms'] },

  // Musculoskeletal
  { code: 'M19.90', description: 'Unspecified osteoarthritis, unspecified site', category: 'Musculoskeletal', notes: ['General osteoarthritis'] },
  { code: 'M05.9', description: 'Rheumatoid arthritis, unspecified', category: 'Musculoskeletal/Autoimmune', notes: ['General rheumatoid arthritis'] },
  { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal', notes: ['Common code for lower back pain'] },
  { code: 'M81.0', description: 'Postmenopausal osteoporosis with current pathological fracture', category: 'Endocrine/Musculoskeletal', notes: ['Bone weakening after menopause, with fracture'] },
  { code: 'S93.40XA', description: 'Sprain of unspecified ligament of ankle, initial encounter', category: 'Musculoskeletal', notes: ['General ankle sprain'] },
  { code: 'M75.30', description: 'Calcific tendinitis, unspecified shoulder', category: 'Musculoskeletal', notes: ['Shoulder tendinitis with calcium deposits'] },
  { code: 'M70.60', description: 'Trochanteric bursitis, unspecified hip', category: 'Musculoskeletal', notes: ['Hip bursitis'] },
  { code: 'M51.26', description: 'Other intervertebral disc displacement, lumbar region', category: 'Musculoskeletal/Neurological', notes: ['Herniated disc in lower back'] },
  { code: 'M86.9', description: 'Osteomyelitis, unspecified', category: 'Musculoskeletal/Infectious Disease', notes: ['Bone infection'] },
  { code: 'M08.00', description: 'Unspecified juvenile rheumatoid arthritis', category: 'Rheumatology/Pediatrics/Autoimmune', notes: ['Childhood arthritis'] },


  // Dermatological
  { code: 'L20.9', description: 'Atopic dermatitis, unspecified', category: 'Dermatological', notes: ['General eczema'] },
  { code: 'L40.9', description: 'Psoriasis, unspecified', category: 'Dermatological', notes: ['General psoriasis'] },
  { code: 'L70.0', description: 'Acne vulgaris', category: 'Dermatological', notes: ['Common acne'] },
  { code: 'L25.9', description: 'Unspecified contact dermatitis, unspecified cause', category: 'Dermatological', notes: ['General contact dermatitis'] },
  { code: 'L03.90', description: 'Cellulitis, unspecified', category: 'Dermatological/Infectious Disease', notes: ['General cellulitis'] },
  { code: 'L50.9', description: 'Urticaria, unspecified', category: 'Dermatological/Allergy', notes: ['General hives'] },
  { code: 'C43.9', description: 'Malignant melanoma of skin, unspecified', category: 'Dermatology/Oncology', notes: ['General melanoma'] },

  // Urinary
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Urinary', notes: ['General UTI code'] },
  { code: 'N20.0', description: 'Calculus of kidney', category: 'Urinary', notes: ['Kidney stone'] },
  { code: 'N40.1', description: 'Benign prostatic hyperplasia with lower urinary tract symptoms', category: 'Urinary (Male)', notes: ['Enlarged prostate with urinary issues'] },
  { code: 'N39.498', description: 'Other specified urinary incontinence', category: 'Urinary', notes: ['General urinary incontinence'] },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified', category: 'Renal', notes: ['General CKD code'] },
  { code: 'N10', description: 'Acute pyelonephritis', category: 'Urinary/Infectious Disease', notes: ['Kidney infection'] },
  { code: 'C61', description: 'Malignant neoplasm of prostate', category: 'Oncology/Urinary (Male)', notes: ['Prostate cancer'] },

  // Eye/Vision
  { code: 'H10.9', description: 'Unspecified conjunctivitis', category: 'Eye/Vision', notes: ['General pink eye'] },
  { code: 'H25.9', description: 'Unspecified age-related cataract', category: 'Eye/Vision', notes: ['General cataract'] },
  { code: 'H40.9', description: 'Unspecified glaucoma', category: 'Eye/Vision', notes: ['General glaucoma'] },
  { code: 'E11.319', description: 'Type 2 diabetes mellitus with unspecified diabetic retinopathy without macular edema', category: 'Eye/Vision/Endocrine', notes: ['Retinal damage from diabetes'] },
  { code: 'H35.31', description: 'Nonexudative age-related macular degeneration', category: 'Eye/Vision', notes: ['Dry AMD'] },

  // Ear/Hearing
  { code: 'H66.90', description: 'Otitis media, unspecified, unspecified ear', category: 'Ear/Hearing', notes: ['General ear infection'] },
  { code: 'H93.19', description: 'Tinnitus, unspecified ear', category: 'Ear/Hearing', notes: ['General ringing in ears'] },
  { code: 'H90.5', description: 'Unspecified sensorineural hearing loss', category: 'Ear/Hearing', notes: ['General sensorineural hearing loss'] },
  { code: 'H81.10', description: 'Benign paroxysmal vertigo, unspecified ear', category: 'Ear/Neurological', notes: ['General BPPV'] },

  // Sleep Disorders
  { code: 'G47.00', description: 'Insomnia, unspecified', category: 'Sleep', notes: ['General insomnia'] },
  { code: 'G47.30', description: 'Sleep apnea, unspecified', category: 'Sleep', notes: ['General sleep apnea'] },
  { code: 'G25.81', description: 'Restless legs syndrome', category: 'Sleep/Neurological', notes: ['RLS'] },

  // Psychological/Mental Health
  { code: 'F41.1', description: 'Generalized anxiety disorder', category: 'Mental Health', notes: ['GAD'] },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health', notes: ['General depression'] },
  { code: 'F41.0', description: 'Panic disorder [episodic paroxysmal anxiety] without agoraphobia', category: 'Mental Health', notes: ['Panic disorder without fear of open spaces'] },
  { code: 'F42.9', description: 'Obsessive-compulsive disorder, unspecified', category: 'Mental Health', notes: ['General OCD'] },
  { code: 'F43.10', description: 'Post-traumatic stress disorder, unspecified', category: 'Mental Health', notes: ['General PTSD'] },
  { code: 'F31.9', description: 'Bipolar disorder, unspecified', category: 'Mental Health', notes: ['General bipolar disorder'] },
  { code: 'F20.9', description: 'Schizophrenia, unspecified', category: 'Mental Health', notes: ['General schizophrenia'] },
  { code: 'F10.20', description: 'Alcohol dependence, uncomplicated', category: 'Mental Health/Addiction', notes: ['Alcohol addiction'] },

  // Infectious Diseases (Cont.)
  { code: 'J11.1', description: 'Influenza with other respiratory manifestations, virus not identified', category: 'Infectious Disease', notes: ['Flu symptoms, virus not specified'] },
  { code: 'U07.1', description: 'COVID-19, virus identified', category: 'Infectious Disease', notes: ['Specific code for confirmed COVID-19'] },
  { code: 'J02.0', description: 'Streptococcal pharyngitis', category: 'Infectious Disease', notes: ['Strep throat'] },
  { code: 'B24', description: 'Unspecified human immunodeficiency virus [HIV] disease', category: 'Infectious Disease/Immunology', notes: ['General HIV infection'] },
  { code: 'A15.9', description: 'Respiratory tuberculosis, unspecified', category: 'Infectious Disease/Respiratory', notes: ['General TB'] },
  { code: 'B37.0', description: 'Candidiasis of mouth', category: 'Infectious Disease/Oral', notes: ['Oral thrush'] },
  { code: 'T78.2XXA', description: 'Anaphylactic shock, unspecified, initial encounter', category: 'Allergy/Immunology/Emergency', notes: ['Severe allergic reaction'] },

  // Reproductive/Genitourinary (Female)
  { code: 'N95.1', description: 'Menopausal and female climacteric states', category: 'Reproductive (Female)', notes: ['Symptoms related to menopause'] },
  { code: 'N76.0', description: 'Acute vaginitis', category: 'Reproductive (Female)', notes: ['Acute vaginal inflammation'] },
  { code: 'N80.9', description: 'Endometriosis, unspecified', category: 'Reproductive (Female)', notes: ['General endometriosis'] },
  { code: 'D25.9', description: 'Leiomyoma of uterus, unspecified', category: 'Reproductive (Female)', notes: ['Uterine fibroids'] },
  { code: 'N81.9', description: 'Female genital prolapse, unspecified', category: 'Reproductive (Female)/Urinary', notes: ['General pelvic organ prolapse'] },

  // Reproductive/Genitourinary (Male)
  { code: 'N52.9', description: 'Male erectile dysfunction, unspecified', category: 'Reproductive (Male)', notes: ['General ED'] },
  { code: 'N41.9', description: 'Inflammatory disease of prostate, unspecified', category: 'Reproductive (Male)', notes: ['General prostatitis'] },
  { code: 'N44.0', description: 'Torsion of testis', category: 'Reproductive (Male)/Emergency', notes: ['Medical emergency, twisted testicle'] },

  // Other Specialties (Cont.)
  { code: 'D69.6', description: 'Thrombocytopenia, unspecified', category: 'Hematological', notes: ['Low platelet count'] },
  { code: 'M32.9', description: 'Systemic lupus erythematosus, unspecified', category: 'Rheumatology/Autoimmune', notes: ['General lupus'] },
  { code: 'M35.00', description: 'Sicca syndrome, unspecified', category: 'Rheumatology/Autoimmune', notes: ['General Sjogren\'s syndrome'] },
];

// Smart Input Component
const SmartInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'condition' | 'code';
  onSelect?: (item: any) => void;
}> = ({ value, onChange, placeholder, type, onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];
    
    const items = type === 'condition' ? MEDICAL_CONDITIONS : ICD10_CODES;
    const results = items.map(item => {
      const searchFields = type === 'condition' 
        ? [item.name, item.category, item.description]
        : [item.code, item.description, item.category];
      
      const maxScore = Math.max(...searchFields.map(field => fuzzySearch(input, field)));
      return { item, score: maxScore };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(result => result.item);

    return results;
  }, [type]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    const newSuggestions = getSuggestions(newValue);
    setSuggestions(newSuggestions);
    setShowDropdown(newSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [onChange, getSuggestions]);

  const handleSuggestionSelect = useCallback((item: any) => {
    onChange(type === 'condition' ? item.name : item.code);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    onSelect?.(item);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [type, onChange, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    const actions = {
      'ArrowDown': () => setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0),
      'ArrowUp': () => setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1),
      'Enter': () => selectedIndex >= 0 && handleSuggestionSelect(suggestions[selectedIndex]),
      'Escape': () => { setShowDropdown(false); setSelectedIndex(-1); }
    };

    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  }, [showDropdown, suggestions, selectedIndex, handleSuggestionSelect]);

  const handleFocus = useCallback(() => {
    if (value.trim()) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowDropdown(newSuggestions.length > 0);
    }
  }, [value, getSuggestions]);

  const handleBlur = useCallback(() => {
    setTimeout(() => { setShowDropdown(false); setSelectedIndex(-1); }, 150);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          inputRef.current && !inputRef.current.contains(target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-3 w-3 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full pl-7 pr-7 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={placeholder}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setShowDropdown(false); setSelectedIndex(-1); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onMouseDown={e => e.preventDefault()}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((item, index) => (
            <div
              key={type === 'condition' ? item.id : item.code}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onMouseDown={e => { e.preventDefault(); handleSuggestionSelect(item); }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium text-gray-900 text-sm mb-1">
                {type === 'condition' ? item.name : item.code}
              </div>
              <div className="text-xs text-gray-600 mb-1">{item.description}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.category}</span>
                {type === 'condition' && item.icd10_codes.length > 0 && (
                  <span className="text-xs text-gray-500 font-mono">{item.icd10_codes[0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Diagnosis Card Component
const DiagnosisCard: React.FC<{
  diagnosis: DiagnosisItem;
  onUpdate: (id: string, field: keyof DiagnosisItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  index: number;
}> = React.memo(({ diagnosis, onUpdate, onRemove, canRemove, index }) => {
  const [showSuggestedNotes, setShowSuggestedNotes] = useState(false);
  
  const suggestedNotes = useMemo(() => {
    const condition = MEDICAL_CONDITIONS.find(c => c.name.toLowerCase() === diagnosis.condition.toLowerCase());
    const code = ICD10_CODES.find(c => c.code === diagnosis.code);
    return [...(condition?.common_notes || []), ...(code?.notes || [])];
  }, [diagnosis.condition, diagnosis.code]);

  const handleConditionSelect = useCallback((condition: MedicalCondition) => {
    onUpdate(diagnosis.id, 'condition', condition.name);
    onUpdate(diagnosis.id, 'category', condition.category);
    if (condition.icd10_codes.length > 0 && !diagnosis.code) {
      onUpdate(diagnosis.id, 'code', condition.icd10_codes[0]);
    }
  }, [diagnosis.id, diagnosis.code, onUpdate]);

  const handleCodeSelect = useCallback((code: ICD10Code) => {
    onUpdate(diagnosis.id, 'code', code.code);
    if (!diagnosis.category) onUpdate(diagnosis.id, 'category', code.category);
  }, [diagnosis.id, diagnosis.category, onUpdate]);

  const addSuggestedNote = useCallback((note: string) => {
    const newNotes = diagnosis.notes ? `${diagnosis.notes}\n• ${note}` : `• ${note}`;
    onUpdate(diagnosis.id, 'notes', newNotes);
  }, [diagnosis.id, diagnosis.notes, onUpdate]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Diagnosis {index + 1}</h3>
            <div className="flex items-center space-x-1 mt-1">
              <select
                value={diagnosis.confidence || 'primary'}
                onChange={e => onUpdate(diagnosis.id, 'confidence', e.target.value)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${getConfidenceBadgeStyle(diagnosis.confidence || 'primary')}`}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="rule-out">Rule Out</option>
              </select>
              {diagnosis.category && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  {diagnosis.category}
                </span>
              )}
            </div>
          </div>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(diagnosis.id)}
            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Medical Condition *</label>
          <SmartInput
            value={diagnosis.condition}
            onChange={value => onUpdate(diagnosis.id, 'condition', value)}
            placeholder="Search medical conditions..."
            type="condition"
            onSelect={handleConditionSelect}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">ICD-10 Code *</label>
          <SmartInput
            value={diagnosis.code}
            onChange={value => onUpdate(diagnosis.id, 'code', value)}
            placeholder="Search ICD-10 codes..."
            type="code"
            onSelect={handleCodeSelect}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-700">Clinical Notes</label>
          {suggestedNotes.length > 0 && (
            <button
              onClick={() => setShowSuggestedNotes(!showSuggestedNotes)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
            >
              <span>Suggested Notes</span>
              {showSuggestedNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
        
        <textarea
          value={diagnosis.notes}
          onChange={e => onUpdate(diagnosis.id, 'notes', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
          rows={3}
          placeholder="Enter clinical notes, treatment recommendations, follow-up instructions..."
        />

        {showSuggestedNotes && suggestedNotes.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
            <h4 className="text-xs font-medium text-blue-800 mb-2">Suggested Clinical Notes:</h4>
            <div className="space-y-1">
              {suggestedNotes.map((note, idx) => (
                <button
                  key={`note-${idx}-${note.slice(0, 20)}`}
                  onClick={() => addSuggestedNote(note)}
                  className="flex items-start text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded w-full transition-colors border border-transparent hover:border-blue-200"
                >
                  <Check className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DiagnosisCard.displayName = 'DiagnosisCard';

// Main Component
const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({ diagnosis_info = [], onChange }) => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>(() => 
    diagnosis_info.length > 0 
      ? diagnosis_info.map(item => ({ ...item, id: item.id || generateUniqueId() }))
      : [{ id: generateUniqueId(), condition: '', code: '', notes: '', confidence: 'primary' as const, category: '' }]
  );

  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const notifyParent = useCallback((newDiagnoses: DiagnosisItem[]) => {
    if (onChange) {
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = setTimeout(() => onChange(newDiagnoses), 100);
    }
  }, [onChange]);

  useEffect(() => () => { if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current); }, []);

  const addDiagnosis = useCallback(() => {
    const newDiagnosis: DiagnosisItem = {
      id: generateUniqueId(), condition: '', code: '', notes: '', confidence: 'primary', category: ''
    };
    setDiagnoses(prev => {
      const newDiagnoses = [...prev, newDiagnosis];
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const removeDiagnosis = useCallback((id: string) => {
    setDiagnoses(prev => {
      const newDiagnoses = prev.filter(d => d.id !== id);
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const updateDiagnosis = useCallback((id: string, field: keyof DiagnosisItem, value: string) => {
    setDiagnoses(prev => {
      const newDiagnoses = prev.map(diagnosis =>
        diagnosis.id === id ? { ...diagnosis, [field]: value } : diagnosis
      );
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const stats = useMemo(() => {
    const completedDiagnoses = diagnoses.filter(d => d.condition && d.code);
    const primaryCount = completedDiagnoses.filter(d => d.confidence === 'primary').length;
    const uniqueCategories = new Set(completedDiagnoses.map(d => d.category).filter(Boolean)).size;
    return { completedDiagnoses, primaryCount, uniqueCategories };
  }, [diagnoses]);

  const StatCard = ({ icon: Icon, color, label, value }: any) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Medical Diagnosis</h1>
              <p className="text-sm text-gray-600">Enter patient diagnoses with ICD-10 codes and clinical notes</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">{diagnoses.length}</div>
              <div className="text-xs text-gray-500">Total Diagnoses</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={FileText} color="bg-blue-100 text-blue-600" label="Completed" value={stats.completedDiagnoses.length} />
          <StatCard icon={Check} color="bg-green-100 text-green-600" label="Primary" value={stats.primaryCount} />
          <StatCard icon={Stethoscope} color="bg-purple-100 text-purple-600" label="Categories" value={stats.uniqueCategories} />
        </div>

        {/* Diagnosis Cards */}
        <div className="space-y-4">
          {diagnoses.map((diagnosis, index) => (
            <DiagnosisCard
              key={diagnosis.id}
              diagnosis={diagnosis}
              onUpdate={updateDiagnosis}
              onRemove={removeDiagnosis}
              canRemove={diagnoses.length > 1}
              index={index}
            />
          ))}
        </div>

        {/* Add Button */}
        <div className="flex justify-center">
          <button
            onClick={addDiagnosis}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Diagnosis
          </button>
        </div>
        
        {/* Summary */}
        {stats.completedDiagnoses.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Diagnosis Summary</h2>
            <div className="space-y-3">
              {stats.completedDiagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{diagnosis.condition}</span>
                      <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                        {diagnosis.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceBadgeStyle(diagnosis.confidence || 'primary')}`}>
                        {formatConfidence(diagnosis.confidence)}
                      </span>
                    </div>
                    {diagnosis.notes && (
                      <p className="text-xs text-gray-600 leading-relaxed">{diagnosis.notes}</p>
                    )}
                  </div>
                  {diagnosis.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full ml-4 font-medium">
                      {diagnosis.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisSection;