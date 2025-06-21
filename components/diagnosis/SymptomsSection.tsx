"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown, X } from "lucide-react";

// Type definitions
interface Symptom {
  id: number;
  name: string;
  severity: "mild" | "moderate" | "severe";
}

interface SymptomsSectionProps {
  symptoms?: Symptom[];
  onChange?: (symptoms: Symptom[]) => void;
}

// Optimized symptoms database
const SYMPTOMS_DB = [
  // General Symptoms
  { id: 1, name: "Fever", cat: "General" },
  { id: 2, name: "Fatigue", cat: "General" },
  { id: 3, name: "Weakness", cat: "General" },
  { id: 4, name: "Loss of appetite", cat: "General" },
  { id: 5, name: "Weight loss", cat: "General" },
  { id: 6, name: "Night sweats", cat: "General" },
  { id: 7, name: "Chills", cat: "General" },
  { id: 8, name: "Malaise", cat: "General" },
  { id: 9, name: "Swollen glands", cat: "General" },
  { id: 10, name: "Unexplained weight gain", cat: "General" },
  { id: 11, name: "Dehydration", cat: "General" },
  { id: 12, name: "Fainting/Syncope", cat: "General" },
  { id: 13, name: "Lethargy", cat: "General" },
  { id: 14, name: "Generalized aches", cat: "General" },
  { id: 15, name: "Mouth sores (General)", cat: "General" }, // General, as could be non-dental
  { id: 16, name: "Difficulty sleeping", cat: "General" }, // More general than 'Insomnia'
  { id: 17, name: "Feeling unwell", cat: "General" },

  // Respiratory Symptoms
  { id: 18, name: "Cough", cat: "Respiratory" },
  { id: 19, name: "Shortness of breath (Dyspnea)", cat: "Respiratory" },
  { id: 20, name: "Chest pain (Respiratory)", cat: "Respiratory" },
  { id: 21, name: "Wheezing", cat: "Respiratory" },
  { id: 22, name: "Runny nose (Rhinorrhea)", cat: "Respiratory" },
  { id: 23, name: "Sore throat (Pharyngitis)", cat: "Respiratory" },
  { id: 24, name: "Sneezing", cat: "Respiratory" },
  { id: 25, name: "Nasal congestion", cat: "Respiratory" },
  { id: 26, name: "Hoarseness", cat: "Respiratory" },
  { id: 27, name: "Sputum production", cat: "Respiratory" },
  { id: 28, name: "Coughing up blood (Hemoptysis)", cat: "Respiratory" },
  { id: 29, name: "Stridor", cat: "Respiratory" },
  { id: 30, name: "Rapid breathing (Tachypnea)", cat: "Respiratory" },
  { id: 31, name: "Loss of voice (Aphonia)", cat: "Respiratory" },
  { id: 32, name: "Shallow breathing", cat: "Respiratory" },
  { id: 33, name: "Blue lips or fingernails (Cyanosis)", cat: "Respiratory" },

  // Gastrointestinal Symptoms
  { id: 34, name: "Nausea", cat: "Gastrointestinal" },
  { id: 35, name: "Vomiting", cat: "Gastrointestinal" },
  { id: 36, name: "Diarrhea", cat: "Gastrointestinal" },
  { id: 37, name: "Constipation", cat: "Gastrointestinal" },
  { id: 38, name: "Abdominal pain", cat: "Gastrointestinal" },
  { id: 39, name: "Heartburn (Pyrosis)", cat: "Gastrointestinal" },
  { id: 40, name: "Bloating", cat: "Gastrointestinal" },
  { id: 41, name: "Indigestion (Dyspepsia)", cat: "Gastrointestinal" },
  { id: 42, name: "Loss of bowel control (Incontinence)", cat: "Gastrointestinal" },
  { id: 43, name: "Blood in stool (Hematochezia/Melena)", cat: "Gastrointestinal" },
  { id: 44, name: "Black, tarry stools (Melena)", cat: "Gastrointestinal" },
  { id: 45, name: "Pale stools", cat: "Gastrointestinal" },
  { id: 46, name: "Yellow skin/eyes (Jaundice)", cat: "Gastrointestinal" },
  { id: 47, name: "Difficulty swallowing (Dysphagia)", cat: "Gastrointestinal" },
  { id: 48, name: "Belching", cat: "Gastrointestinal" },
  { id: 49, name: "Flatulence", cat: "Gastrointestinal" },
  { id: 50, name: "Abdominal cramping", cat: "Gastrointestinal" },
  { id: 51, name: "Rectal pain", cat: "Gastrointestinal" },
  { id: 52, name: "Loss of appetite (GI)", cat: "Gastrointestinal" },

  // Neurological Symptoms
  { id: 53, name: "Headache", cat: "Neurological" },
  { id: 54, name: "Dizziness (Vertigo)", cat: "Neurological" },
  { id: 55, name: "Confusion", cat: "Neurological" },
  { id: 56, name: "Memory problems", cat: "Neurological" },
  { id: 57, name: "Seizures", cat: "Neurological" },
  { id: 58, name: "Numbness", cat: "Neurological" },
  { id: 59, name: "Tingling (Paresthesia)", cat: "Neurological" },
  { id: 60, name: "Weakness (Neurological)", cat: "Neurological" },
  { id: 61, name: "Tremors", cat: "Neurological" },
  { id: 62, name: "Loss of balance/Coordination problems (Ataxia)", cat: "Neurological" },
  { id: 63, name: "Speech difficulties (Dysarthria/Aphasia)", cat: "Neurological" },
  { id: 64, name: "Vision changes (Neurological)", cat: "Neurological" },
  { id: 65, name: "Difficulty walking", cat: "Neurological" },
  { id: 66, name: "Loss of consciousness", cat: "Neurological" },
  { id: 67, name: "Facial droop", cat: "Neurological" },
  { id: 68, name: "Ringing in ears (Tinnitus - Neurological)", cat: "Neurological" },
  { id: 69, name: "Lightheadedness", cat: "Neurological" },
  { id: 70, name: "Migraine", cat: "Neurological" },
  { id: 71, name: "Pins and needles sensation", cat: "Neurological" },
  { id: 72, name: "Difficulty with fine motor skills", cat: "Neurological" },

  // Musculoskeletal Symptoms
  { id: 73, name: "Joint pain (Arthralgia)", cat: "Musculoskeletal" },
  { id: 74, name: "Muscle pain (Myalgia)", cat: "Musculoskeletal" },
  { id: 75, name: "Back pain", cat: "Musculoskeletal" },
  { id: 76, name: "Stiffness", cat: "Musculoskeletal" },
  { id: 77, name: "Swelling (Musculoskeletal)", cat: "Musculoskeletal" },
  { id: 78, name: "Reduced range of motion", cat: "Musculoskeletal" },
  { id: 79, name: "Joint redness/warmth", cat: "Musculoskeletal" },
  { id: 80, name: "Muscle weakness", cat: "Musculoskeletal" },
  { id: 81, name: "Cramps", cat: "Musculoskeletal" },
  { id: 82, name: "Gout attack", cat: "Musculoskeletal" },
  { id: 83, name: "Bone pain", cat: "Musculoskeletal" },
  { id: 84, name: "Clicking or popping joints", cat: "Musculoskeletal" },
  { id: 85, name: "Difficulty standing", cat: "Musculoskeletal" },

  // Cardiovascular Symptoms
  { id: 86, name: "Palpitations", cat: "Cardiovascular" },
  { id: 87, name: "Irregular heartbeat (Arrhythmia)", cat: "Cardiovascular" },
  { id: 88, name: "Chest tightness", cat: "Cardiovascular" },
  { id: 89, name: "Shortness of breath (Cardiovascular)", cat: "Cardiovascular" },
  { id: 90, name: "Swelling in legs/ankles (Edema)", cat: "Cardiovascular" },
  { id: 91, name: "Dizziness (Cardiovascular)", cat: "Cardiovascular" },
  { id: 92, name: "Cyanosis (bluish discoloration - Cardiovascular)", cat: "Cardiovascular" },
  { id: 93, name: "Claudication (leg pain with exercise)", cat: "Cardiovascular" },
  { id: 94, name: "Rapid heart rate (Tachycardia)", cat: "Cardiovascular" },
  { id: 95, name: "Slow heart rate (Bradycardia)", cat: "Cardiovascular" },
  { id: 96, name: "High blood pressure (Hypertension)", cat: "Cardiovascular" },
  { id: 97, name: "Low blood pressure (Hypotension)", cat: "Cardiovascular" },
  { id: 98, name: "Angina (chest pain)", cat: "Cardiovascular" },
  { id: 99, name: "Cold extremities", cat: "Cardiovascular" },
  { id: 100, name: "Varicose veins", cat: "Cardiovascular" },

  // Dermatological Symptoms
  { id: 101, name: "Rash", cat: "Dermatological" },
  { id: 102, name: "Itching (Pruritus)", cat: "Dermatological" },
  { id: 103, name: "Dry skin (Xerosis)", cat: "Dermatological" },
  { id: 104, name: "Bruising (Ecchymosis)", cat: "Dermatological" },
  { id: 105, name: "Skin redness (Erythema)", cat: "Dermatological" },
  { id: 106, name: "Hives (Urticaria)", cat: "Dermatological" },
  { id: 107, name: "Blisters", cat: "Dermatological" },
  { id: 108, name: "Sores/Ulcers", cat: "Dermatological" },
  { id: 109, name: "Nodules/Lumps", cat: "Dermatological" },
  { id: 110, name: "Hair loss (Alopecia)", cat: "Dermatological" },
  { id: 111, name: "Nail changes", cat: "Dermatological" },
  { id: 112, name: "Increased sweating (Hyperhidrosis - Dermatological)", cat: "Dermatological" },
  { id: 113, name: "Acne", cat: "Dermatological" },
  { id: 114, name: "Eczema", cat: "Dermatological" },
  { id: 115, name: "Psoriasis", cat: "Dermatological" },
  { id: 116, name: "Skin discoloration", cat: "Dermatological" },
  { id: 117, name: "New moles or changes to existing moles", cat: "Dermatological" },

  // Urinary Symptoms
  { id: 118, name: "Frequent urination (Polyuria - Urinary)", cat: "Urinary" },
  { id: 119, name: "Painful urination (Dysuria)", cat: "Urinary" },
  { id: 120, name: "Blood in urine (Hematuria)", cat: "Urinary" },
  { id: 121, name: "Urgency to urinate", cat: "Urinary" },
  { id: 122, name: "Difficulty starting urination (Hesitancy)", cat: "Urinary" },
  { id: 123, name: "Loss of bladder control (Incontinence)", cat: "Urinary" },
  { id: 124, name: "Cloudy urine", cat: "Urinary" },
  { id: 125, name: "Strong smelling urine", cat: "Urinary" },
  { id: 126, name: "Nocturia (night urination)", cat: "Urinary" },
  { id: 127, name: "Kidney pain (flank pain)", cat: "Urinary" },
  { id: 128, name: "Difficulty completely emptying bladder", cat: "Urinary" },

  // Eye/Vision Symptoms
  { id: 129, name: "Blurred vision", cat: "Eye/Vision" },
  { id: 130, name: "Eye pain", cat: "Eye/Vision" },
  { id: 131, name: "Double vision (Diplopia)", cat: "Eye/Vision" },
  { id: 132, name: "Red eyes", cat: "Eye/Vision" },
  { id: 133, name: "Itchy eyes", cat: "Eye/Vision" },
  { id: 134, name: "Light sensitivity (Photophobia)", cat: "Eye/Vision" },
  { id: 135, name: "Watery eyes", cat: "Eye/Vision" },
  { id: 136, name: "Dry eyes", cat: "Eye/Vision" },
  { id: 137, name: "Floaters/Flashes", cat: "Eye/Vision" },
  { id: 138, name: "Loss of peripheral vision", cat: "Eye/Vision" },
  { id: 139, name: "Difficulty seeing at night (Nyctalopia)", cat: "Eye/Vision" },
  { id: 140, name: "Gritty sensation in eyes", cat: "Eye/Vision" },

  // Ear/Hearing Symptoms
  { id: 141, name: "Ear pain (Otalgia)", cat: "Ear/Hearing" },
  { id: 142, name: "Hearing loss", cat: "Ear/Hearing" },
  { id: 143, name: "Ringing in ears (Tinnitus)", cat: "Ear/Hearing" },
  { id: 144, name: "Dizziness/Vertigo (Ear-related)", cat: "Ear/Hearing" },
  { id: 145, name: "Ear discharge", cat: "Ear/Hearing" },
  { id: 146, name: "Fullness in ear", cat: "Ear/Hearing" },
  { id: 147, name: "Popping sound in ear", cat: "Ear/Hearing" },
  { id: 148, name: "Balance problems (Ear-related)", cat: "Ear/Hearing" },

  // Sleep Symptoms
  { id: 149, name: "Insomnia", cat: "Sleep" },
  { id: 150, name: "Excessive sleepiness (Hypersomnia)", cat: "Sleep" },
  { id: 151, name: "Sleep apnea", cat: "Sleep" },
  { id: 152, name: "Difficulty falling asleep", cat: "Sleep" },
  { id: 153, name: "Difficulty staying asleep", cat: "Sleep" },
  { id: 154, name: "Restless legs syndrome", cat: "Sleep" },
  { id: 155, name: "Narcolepsy", cat: "Sleep" },
  { id: 156, name: "Snoring (Sleep)", cat: "Sleep" }, // Specific to sleep context
  { id: 157, name: "Nightmares", cat: "Sleep" },

  // Psychological/Mental Health Symptoms
  { id: 158, name: "Anxiety", cat: "Psychological" },
  { id: 159, name: "Depression", cat: "Psychological" },
  { id: 160, name: "Irritability", cat: "Psychological" },
  { id: 161, name: "Mood swings", cat: "Psychological" },
  { id: 162, name: "Panic attacks", cat: "Psychological" },
  { id: 163, name: "Hallucinations", cat: "Psychological" },
  { id: 164, name: "Delusions", cat: "Psychological" },
  { id: 165, name: "Loss of interest (Anhedonia)", cat: "Psychological" },
  { id: 166, name: "Difficulty concentrating", cat: "Psychological" },
  { id: 167, name: "Suicidal thoughts", cat: "Psychological" },
  { id: 168, name: "Self-harm thoughts/behavior", cat: "Psychological" },
  { id: 169, name: "Obsessive thoughts", cat: "Psychological" },
  { id: 170, name: "Compulsive behaviors", cat: "Psychological" },
  { id: 171, name: "Extreme sadness", cat: "Psychological" },
  { id: 172, name: "Social withdrawal", cat: "Psychological" },

  // Endocrine/Metabolic Symptoms
  { id: 173, name: "Increased thirst (Polydipsia - Endocrine)", cat: "Endocrine/Metabolic" },
  { id: 174, name: "Increased hunger (Polyphagia - Endocrine)", cat: "Endocrine/Metabolic" },
  { id: 175, name: "Frequent urination (Endocrine)", cat: "Endocrine/Metabolic" },
  { id: 176, name: "Heat intolerance", cat: "Endocrine/Metabolic" },
  { id: 177, name: "Cold intolerance", cat: "Endocrine/Metabolic" },
  { id: 178, name: "Hair changes (Endocrine)", cat: "Endocrine/Metabolic" },
  { id: 179, name: "Skin changes (Endocrine)", cat: "Endocrine/Metabolic" },
  { id: 180, name: "Thyroid enlargement (Goiter)", cat: "Endocrine/Metabolic" },
  { id: 181, name: "Unexpected weight changes", cat: "Endocrine/Metabolic" },
  { id: 182, name: "Fatigue (Endocrine)", cat: "Endocrine/Metabolic" }, // Can be specific to endocrine issues
  { id: 183, name: "Sweating (Endocrine)", cat: "Endocrine/Metabolic" },

  // Reproductive/Genitourinary Symptoms (Female)
  { id: 184, name: "Irregular periods", cat: "Reproductive (Female)" },
  { id: 185, name: "Heavy periods (Menorrhagia)", cat: "Reproductive (Female)" },
  { id: 186, name: "Painful periods (Dysmenorrhea)", cat: "Reproductive (Female)" },
  { id: 187, name: "Vaginal discharge", cat: "Reproductive (Female)" },
  { id: 188, name: "Vaginal itching", cat: "Reproductive (Female)" },
  { id: 189, name: "Pelvic pain", cat: "Reproductive (Female)" },
  { id: 190, name: "Pain during intercourse (Dyspareunia)", cat: "Reproductive (Female)" },
  { id: 191, name: "Hot flashes", cat: "Reproductive (Female)" },
  { id: 192, name: "Breast pain", cat: "Reproductive (Female)" },
  { id: 193, name: "Nipple discharge", cat: "Reproductive (Female)" },
  { id: 194, name: "Lower abdominal pain (Female)", cat: "Reproductive (Female)" },
  { id: 195, name: "Infertility concerns", cat: "Reproductive (Female)" },

  // Reproductive/Genitourinary Symptoms (Male)
  { id: 196, name: "Erectile dysfunction", cat: "Reproductive (Male)" },
  { id: 197, name: "Testicular pain/swelling", cat: "Reproductive (Male)" },
  { id: 198, name: "Penile discharge", cat: "Reproductive (Male)" },
  { id: 199, name: "Difficulty urinating (Male)", cat: "Reproductive (Male)" },
  { id: 200, name: "Reduced libido", cat: "Reproductive (Male)" },
  { id: 201, name: "Prostate pain", cat: "Reproductive (Male)" },
  { id: 202, name: "Groin pain", cat: "Reproductive (Male)" },

  // Oral/Dental Symptoms
  { id: 203, name: "Toothache", cat: "Oral/Dental" },
  { id: 204, name: "Gum bleeding", cat: "Oral/Dental" },
  { id: 205, name: "Mouth sores", cat: "Oral/Dental" },
  { id: 206, name: "Dry mouth (Xerostomia)", cat: "Oral/Dental" },
  { id: 207, name: "Bad breath (Halitosis)", cat: "Oral/Dental" },
  { id: 208, name: "Jaw pain", cat: "Oral/Dental" },
  { id: 209, name: "Difficulty chewing", cat: "Oral/Dental" },
  { id: 210, name: "Swollen tongue", cat: "Oral/Dental" },
  { id: 211, name: "Taste changes", cat: "Oral/Dental" },
  { id: 212, name: "Sore gums", cat: "Oral/Dental" },
  { id: 213, name: "Loose teeth", cat: "Oral/Dental" },

  // Lymphatic/Immune Symptoms
  { id: 214, name: "Swollen lymph nodes", cat: "Lymphatic/Immune" },
  { id: 215, name: "Recurrent infections", cat: "Lymphatic/Immune" },
  { id: 216, name: "Allergic reaction (general)", cat: "Lymphatic/Immune" },
  { id: 217, name: "Autoimmune flare-up", cat: "Lymphatic/Immune" },
  { id: 218, name: "Easy bruising", cat: "Lymphatic/Immune" },
  { id: 219, name: "Prolonged bleeding", cat: "Lymphatic/Immune" },

  // Pain Symptoms (General)
  { id: 220, name: "Localized pain", cat: "Pain (General)" },
  { id: 221, name: "Generalized pain", cat: "Pain (General)" },
  { id: 222, name: "Sharp pain", cat: "Pain (General)" },
  { id: 223, name: "Dull ache", cat: "Pain (General)" },
  { id: 224, name: "Burning pain", cat: "Pain (General)" },
  { id: 225, name: "Stabbing pain", cat: "Pain (General)" },
  { id: 226, name: "Throbbing pain", cat: "Pain (General)" },
  { id: 227, name: "Radiating pain", cat: "Pain (General)" },
  { id: 228, name: "Chronic pain", cat: "Pain (General)" },
  { id: 229, name: "Acute pain", cat: "Pain (General)" },
  { id: 230, name: "Nerve pain", cat: "Pain (General)" },

  // Other Miscellaneous Symptoms
  { id: 231, name: "Bad taste in mouth", cat: "Other" },
  { id: 232, name: "Swollen glands (Neck/Groin)", cat: "Other" },
  { id: 233, name: "Excessive thirst", cat: "Other" },
  { id: 234, name: "Increased sweating", cat: "Other" },
  { id: 235, name: "Sensitivity to light (General)", cat: "Other" },
  { id: 236, name: "Sensitivity to sound (General)", cat: "Other" },
  { id: 237, name: "Poor circulation", cat: "Other" },
  { id: 238, name: "Change in voice", cat: "Other" },
  { id: 239, name: "Snoring", cat: "Other" },
  { id: 240, name: "Loss of smell (Anosmia)", cat: "Other" },
  { id: 241, name: "Loss of taste (Ageusia)", cat: "Other" },
  { id: 242, name: "Swollen ankles", cat: "Other" },
  { id: 243, name: "Yellow skin", cat: "Other" },
  { id: 244, name: "Pale skin", cat: "Other" },
  { id: 245, name: "Excessive urination (beyond Polyuria)", cat: "Other" },
  { id: 246, name: "Hair thinning", cat: "Other" },
  { id: 247, name: "Brittle nails", cat: "Other" },
  { id: 248, name: "Cold hands/feet", cat: "Other" },
  { id: 249, name: "Heat intolerance (General)", cat: "Other" },
  { id: 250, name: "Cold intolerance (General)", cat: "Other" },
  { id: 251, name: "Unusual bleeding", cat: "Other" },
  { id: 252, name: "Unusual discharge", cat: "Other" },
  { id: 253, name: "Lumps or growths", cat: "Other" },
  { id: 254, name: "Numbness or tingling in extremities", cat: "Other" },
  { id: 255, name: "Difficulty speaking", cat: "Other" },
  { id: 256, name: "Difficulty understanding speech", cat: "Other" },
  { id: 257, name: "Slurred speech", cat: "Other" },
  { id: 258, name: "Trembling", cat: "Other" },
  { id: 259, name: "Muscle cramps", cat: "Other" },
  { id: 260, name: "Muscle spasms", cat: "Other" },
  { id: 261, name: "Stuttering", cat: "Other" },
  { id: 262, name: "Excessive thirst", cat: "Other" },
  { id: 263, name: "Increased urination", cat: "Other" },
  { id: 264, name: "Difficulty with balance", cat: "Other" },
  { id: 265, name: "Gait disturbance", cat: "Other" },
  { id: 266, name: "Involuntary movements", cat: "Other" },
  { id: 267, name: "Difficulty breathing", cat: "Other" },
  { id: 268, name: "Swelling in face/neck", cat: "Other" },
  { id: 269, name: "Changes in skin color", cat: "Other" },
  { id: 270, name: "Excessive yawning", cat: "Other" },
  { id: 271, name: "Changes in bowel habits", cat: "Other" },
  { id: 272, name: "Changes in urine color", cat: "Other" },
  { id: 273, name: "Changes in hair texture", cat: "Other" },
  { id: 274, name: "Changes in nail thickness", cat: "Other" },
  { id: 275, name: "Recurrent headaches", cat: "Other" },
  { id: 276, name: "Sudden weakness", cat: "Other" },
  { id: 277, name: "Loss of sensation", cat: "Other" },
  { id: 278, name: "Difficulty concentrating", cat: "Other" },
  { id: 279, name: "Forgetfulness", cat: "Other" },
  { id: 280, name: "Difficulty making decisions", cat: "Other" },
  { id: 281, name: "Lack of motivation", cat: "Other" },
  { id: 282, name: "Feeling overwhelmed", cat: "Other" },
  { id: 283, name: "Persistent sadness", cat: "Other" },
  { id: 284, name: "Loss of enjoyment", cat: "Other" },
  { id: 285, name: "Anxiety attacks", cat: "Other" },
  { id: 286, name: "Shortness of temper", cat: "Other" },
  { id: 287, name: "Sudden mood changes", cat: "Other" },
  { id: 288, name: "Paranoia", cat: "Other" },
  { id: 289, name: "Delusions of grandeur", cat: "Other" },
  { id: 290, name: "Auditory hallucinations", cat: "Other" },
  { id: 291, name: "Visual hallucinations", cat: "Other" },
  { id: 292, name: "Increased energy", cat: "Other" },
  { id: 293, name: "Decreased need for sleep", cat: "Other" },
  { id: 294, name: "Racing thoughts", cat: "Other" },
  { id: 295, name: "Compulsive urges", cat: "Other" },
  { id: 296, name: "Repetitive behaviors", cat: "Other" },
  { id: 297, name: "Fear of specific situations", cat: "Other" },
  { id: 298, name: "Avoidance behaviors", cat: "Other" },
  { id: 299, name: "Flashbacks", cat: "Other" },
  { id: 300, name: "Nightmares", cat: "Other" },
  { id: 301, name: "Easily startled", cat: "Other" },
  { id: 302, name: "Tension headaches", cat: "Other" },
  { id: 303, name: "Muscle tension", cat: "Other" },
  { id: 304, name: "Restlessness", cat: "Other" },
  { id: 305, name: "Fatigue that doesn't improve with rest", cat: "Other" },
  { id: 306, name: "Joint swelling", cat: "Other" },
  { id: 307, name: "Joint warmth", cat: "Other" },
  { id: 308, name: "Joint stiffness (morning)", cat: "Other" },
  { id: 309, name: "Loss of coordination", cat: "Other" },
  { id: 310, name: "Muscle cramps at night", cat: "Other" },
  { id: 311, name: "Difficulty standing up from a chair", cat: "Other" },
  { id: 312, name: "Difficulty climbing stairs", cat: "Other" },
  { id: 313, name: "Difficulty lifting objects", cat: "Other" },
  { id: 314, name: "Pain after exercise", cat: "Other" },
  { id: 315, name: "Numbness in hands/feet", cat: "Other" },
  { id: 316, name: "Tingling in hands/feet", cat: "Other" },
  { id: 317, name: "Changes in vision (blurred/double)", cat: "Other" },
  { id: 318, name: "Eye dryness", cat: "Other" },
  { id: 319, name: "Eye tearing", cat: "Other" },
  { id: 320, name: "Sensitivity to light (eyes)", cat: "Other" },
  { id: 321, name: "Hearing changes (muffled/ringing)", cat: "Other" },
  { id: 322, name: "Dizziness upon standing", cat: "Other" },
  { id: 323, name: "Chronic cough", cat: "Other" },
  { id: 324, name: "Difficulty swallowing liquids", cat: "Other" },
  { id: 325, name: "Heartburn after meals", cat: "Other" },
  { id: 326, name: "Frequent indigestion", cat: "Other" },
  { id: 327, name: "Abdominal distension", cat: "Other" },
  { id: 328, name: "Changes in stool consistency", cat: "Other" },
  { id: 329, name: "Pain during bowel movements", cat: "Other" },
  { id: 330, name: "Constipation alternating with diarrhea", cat: "Other" },
  { id: 331, name: "Yellowing of skin or eyes", cat: "Other" },
  { id: 332, name: "Dark urine", cat: "Other" },
  { id: 333, name: "Pale stools", cat: "Other" },
  { id: 334, name: "Loss of taste or smell (non-respiratory)", cat: "Other" },
  { id: 335, name: "Metallic taste in mouth", cat: "Other" },
  { id: 336, name: "Bleeding gums", cat: "Other" },
  { id: 337, name: "Loose teeth", cat: "Other" },
  { id: 338, name: "Sore spots in mouth", cat: "Other" },
  { id: 339, name: "Difficulty opening mouth fully", cat: "Other" },
  { id: 340, name: "Jaw clicking", cat: "Other" },
  { id: 341, name: "Pain in jaw joint", cat: "Other" },
  { id: 342, name: "Swollen neck", cat: "Other" },
  { id: 343, name: "Hoarseness lasting more than 2 weeks", cat: "Other" },
  { id: 344, name: "Frequent sore throats", cat: "Other" },
  { id: 345, name: "Difficulty breathing through nose", cat: "Other" },
  { id: 346, name: "Nosebleeds", cat: "Other" },
  { id: 347, name: "Facial pain or pressure", cat: "Other" },
  { id: 348, name: "Puffiness around eyes", cat: "Other" },
  { id: 349, name: "Swelling in hands/feet", cat: "Other" },
  { id: 350, name: "Weight gain/loss (unexplained)", cat: "Other" },
  { id: 351, name: "Changes in hair distribution", cat: "Other" },
  { id: 352, name: "Excessive facial hair (female)", cat: "Other" },
  { id: 353, name: "Acne (adult onset)", cat: "Other" },
  { id: 354, name: "Skin tags", cat: "Other" },
  { id: 355, name: "Dark patches of skin", cat: "Other" },
  { id: 356, name: "Easy bruising", cat: "Other" },
  { id: 357, name: "Excessive bleeding after cuts", cat: "Other" },
  { id: 358, name: "Frequent infections (non-respiratory)", cat: "Other" },
  { id: 359, name: "Slow wound healing", cat: "Other" },
  { id: 360, name: "Recurrent boils", cat: "Other" },
  { id: 361, name: "Feeling generally unwell", cat: "Other" },
  { id: 362, name: "Loss of libido", cat: "Other" },
  { id: 363, name: "Changes in menstrual cycle (general)", cat: "Other" },
  { id: 364, name: "Painful urination (general)", cat: "Other" },
  { id: 365, name: "Increased vaginal discharge", cat: "Other" },
  { id: 366, name: "Genital itching", cat: "Other" },
  { id: 367, name: "Pain during intercourse (general)", cat: "Other" },
  { id: 368, name: "Changes in breast size/shape", cat: "Other" },
  { id: 369, name: "Lumps in breast", cat: "Other" },
  { id: 370, name: "Nipple discharge (general)", cat: "Other" },
  { id: 371, name: "Pain in testicles", cat: "Other" },
  { id: 372, name: "Swelling in scrotum", cat: "Other" },
  { id: 373, name: "Difficulty achieving erection", cat: "Other" },
  { id: 374, name: "Premature ejaculation", cat: "Other" },
  { id: 375, name: "Reduced sperm count concerns", cat: "Other" },
  { id: 376, name: "Joint redness", cat: "Other" },
  { id: 377, name: "Muscle stiffness", cat: "Other" },
  { id: 378, name: "Difficulty moving a limb", cat: "Other" },
  { id: 379, name: "Joint locking", cat: "Other" },
  { id: 380, name: "Grinding sensation in joints", cat: "Other" },
  { id: 381, name: "Muscle weakness affecting daily tasks", cat: "Other" },
  { id: 382, name: "Sudden onset of severe pain", cat: "Other" },
  { id: 383, name: "Pain worsened by specific movements", cat: "Other" },
  { id: 384, name: "Burning sensation on skin", cat: "Other" },
  { id: 385, name: "Electric shock sensation", cat: "Other" },
  { id: 386, name: "Pins and needles (general)", cat: "Other" },
  { id: 387, name: "Sensitivity to touch", cat: "Other" },
  { id: 388, name: "Persistent itching without rash", cat: "Other" },
  { id: 389, name: "Skin peeling", cat: "Other" },
  { id: 390, name: "Cracked skin", cat: "Other" },
  { id: 391, name: "Fungal nail infection", cat: "Other" },
  { id: 392, name: "Hair loss in patches", cat: "Other" },
  { id: 393, name: "Excessive hair growth", cat: "Other" },
  { id: 394, name: "Excessive body odor", cat: "Other" },
  { id: 395, name: "Changes in vision (floaters/spots)", cat: "Other" },
  { id: 396, name: "Seeing halos around lights", cat: "Other" },
  { id: 397, name: "Sudden loss of vision", cat: "Other" },
  { id: 398, name: "Pressure in eye", cat: "Other" },
  { id: 399, name: "Eye discharge", cat: "Other" },
  { id: 400, name: "Difficulty hearing in noisy environments", cat: "Other" },
  { id: 401, name: "Muffled hearing", cat: "Other" },
  { id: 402, name: "Difficulty understanding speech (hearing)", cat: "Other" },
  { id: 403, name: "Feeling off-balance (general)", cat: "Other" },
  { id: 404, name: "Dizziness when turning head", cat: "Other" },
  { id: 405, name: "Sudden feeling of being detached from reality", cat: "Other" },
  { id: 406, name: "Feeling of unreality", cat: "Other" },
  { id: 407, name: "Extreme mood swings (non-psychological cat)", cat: "Other" },
  { id: 408, name: "Difficulty managing daily tasks", cat: "Other" },
  { id: 409, name: "Loss of interest in hobbies", cat: "Other" },
  { id: 410, name: "Changes in appetite (increased/decreased)", cat: "Other" },
  { id: 411, name: "Changes in sleep patterns (more/less than usual)", cat: "Other" },
  { id: 412, name: "Difficulty waking up", cat: "Other" },
  { id: 413, name: "Restless sleep", cat: "Other" },
  { id: 414, name: "Frequent nightmares", cat: "Other" },
  { id: 415, name: "Sleepwalking", cat: "Other" },
  { id: 416, name: "Talking in sleep", cat: "Other" },
  { id: 417, name: "Teeth grinding (Bruxism)", cat: "Other" },
  { id: 418, name: "Snorting or gasping during sleep", cat: "Other" },
  { id: 419, name: "Excessive daytime fatigue", cat: "Other" },
  { id: 420, name: "Dry mouth at night", cat: "Other" },
  { id: 421, name: "Sore throat in morning", cat: "Other" },
  { id: 422, name: "Sexual dysfunction (general)", cat: "Other" },
  { id: 423, name: "Changes in sex drive", cat: "Other" },
  { id: 424, name: "Pain during ejaculation", cat: "Other" },
  { id: 425, name: "Abnormal vaginal bleeding", cat: "Other" },
  { id: 426, name: "Post-menopausal bleeding", cat: "Other" },
  { id: 427, name: "Irregular menstrual cycles", cat: "Other" },
  { id: 428, name: "Amenorrhea (absence of periods)", cat: "Other" },
  { id: 429, name: "Excessive menstrual bleeding", cat: "Other" },
  { id: 430, name: "Painful urination (general)", cat: "Other" },
  { id: 431, name: "Urinary retention", cat: "Other" },
  { id: 432, name: "Weak urine stream", cat: "Other" },
  { id: 433, name: "Frequent urges to urinate (general)", cat: "Other" },
  { id: 434, name: "Bedwetting (adult onset)", cat: "Other" },
  { id: 435, name: "Loss of control over urination", cat: "Other" },
  { id: 436, name: "Blood in semen", cat: "Other" },
  { id: 437, name: "Unexplained infertility", cat: "Other" },
  { id: 438, name: "Swollen neck glands", cat: "Other" },
  { id: 439, name: "Recurrent fever", cat: "Other" },
  { id: 440, name: "Frequent colds", cat: "Other" },
  { id: 441, name: "Slow healing of cuts", cat: "Other" },
  { id: 442, name: "Excessive thirst (general)", cat: "Other" },
  { id: 443, name: "Persistent headache", cat: "Other" },
  { id: 444, name: "Lightheadedness upon standing", cat: "Other" },
  { id: 445, name: "Shortness of breath on exertion", cat: "Other" },
  { id: 446, name: "Swelling of legs and ankles (general)", cat: "Other" },
  { id: 447, name: "Pain in calves during walking", cat: "Other" },
  { id: 448, name: "Coldness in one limb", cat: "Other" },
  { id: 449, name: "Skin ulcers on legs/feet", cat: "Other" },
  { id: 450, name: "Nail clubbing", cat: "Other" },
  { id: 451, name: "Dry, brittle hair", cat: "Other" },
  { id: 452, name: "Skin rash (general)", cat: "Other" },
  { id: 453, name: "Persistent itching", cat: "Other" },
  { id: 454, name: "Changes in skin texture", cat: "Other" },
  { id: 455, name: "Skin growths", cat: "Other" },
  { id: 456, name: "Excessive sweating (general)", cat: "Other" },
  { id: 457, name: "Unexplained bleeding/bruising", cat: "Other" },
  { id: 458, name: "Jaundice (general)", cat: "Other" },
  { id: 459, name: "Yellow eyes", cat: "Other" },
  { id: 460, name: "Dark urine (general)", cat: "Other" },
  { id: 461, name: "Clay-colored stools", cat: "Other" },
  { id: 462, name: "Abdominal swelling", cat: "Other" },
  { id: 463, name: "Changes in appetite", cat: "Other" },
  { id: 464, name: "Unexplained nausea", cat: "Other" },
  { id: 465, name: "Chronic diarrhea", cat: "Other" },
  { id: 466, name: "Chronic constipation", cat: "Other" },
  { id: 467, name: "Difficulty absorbing nutrients", cat: "Other" },
  { id: 468, name: "Fatigue after eating", cat: "Other" },
  { id: 469, name: "Bloating after meals", cat: "Other" },
  { id: 470, name: "Intolerance to certain foods", cat: "Other" },
  { id: 471, name: "Unexplained weight changes", cat: "Other" },
  { id: 472, name: "Muscle cramps", cat: "Other" },
  { id: 473, name: "Muscle spasms", cat: "Other" },
  { id: 474, name: "Joint stiffness (general)", cat: "Other" },
  { id: 475, name: "Joint pain with movement", cat: "Other" },
  { id: 476, name: "Back pain radiating to legs", cat: "Other" },
  { id: 477, name: "Neck stiffness", cat: "Other" },
  { id: 478, name: "Shoulder pain", cat: "Other" },
  { id: 479, name: "Knee pain", cat: "Other" },
  { id: 480, name: "Hip pain", cat: "Other" },
  { id: 481, name: "Foot pain", cat: "Other" },
  { id: 482, name: "Hand pain", cat: "Other" },
  { id: 483, name: "Wrist pain", cat: "Other" },
  { id: 484, name: "Elbow pain", cat: "Other" },
  { id: 485, name: "Loss of grip strength", cat: "Other" },
  { id: 486, name: "Difficulty with fine motor tasks", cat: "Other" },
  { id: 487, name: "Tremors at rest", cat: "Other" },
  { id: 488, name: "Tremors with movement", cat: "Other" },
  { id: 489, name: "Dyskinesia (involuntary movements)", cat: "Other" },
  { id: 490, name: "Difficulty initiating movement", cat: "Other" },
  { id: 491, name: "Shuffling gait", cat: "Other" },
  { id: 492, name: "Balance problems (general)", cat: "Other" },
  { id: 493, name: "Frequent falls", cat: "Other" },
  { id: 494, name: "Speech slurring", cat: "Other" },
  { id: 495, name: "Difficulty finding words", cat: "Other" },
  { id: 496, name: "Difficulty understanding complex sentences", cat: "Other" },
  { id: 497, name: "Memory loss (general)", cat: "Other" },
  { id: 498, name: "Short-term memory loss", cat: "Other" },
  { id: 499, name: "Long-term memory loss", cat: "Other" },
  { id: 500, name: "Difficulty with problem-solving", cat: "Other" },
  { id: 501, name: "Changes in personality", cat: "Other" },
  { id: 502, name: "Increased irritability", cat: "Other" },
  { id: 503, name: "Social withdrawal", cat: "Other" },
  { id: 504, name: "Loss of interest in previously enjoyed activities", cat: "Other" },
  { id: 505, name: "Delusions of persecution", cat: "Other" },
  { id: 506, name: "Hearing voices", cat: "Other" },
  { id: 507, name: "Seeing things that aren't there", cat: "Other" },
  { id: 508, name: "Feeling hopeless", cat: "Other" },
  { id: 509, name: "Thoughts of death or self-harm", cat: "Other" },
  { id: 510, name: "Increased risk-taking behavior", cat: "Other" },
  { id: 511, name: "Loss of empathy", cat: "Other" },
  { id: 512, name: "Difficulty regulating emotions", cat: "Other" },
  { id: 513, name: "Sudden onset of fear or panic", cat: "Other" },
  { id: 514, name: "Heart racing (panic)", cat: "Other" },
  { id: 515, name: "Shortness of breath (panic)", cat: "Other" },
  { id: 516, name: "Sweating (panic)", cat: "Other" },
  { id: 517, name: "Trembling (panic)", cat: "Other" },
  { id: 518, name: "Chest pain (panic)", cat: "Other" },
  { id: 519, name: "Nausea (panic)", cat: "Other" },
  { id: 520, name: "Dizziness (panic)", cat: "Other" },
  { id: 521, name: "Feeling faint (panic)", cat: "Other" },
  { id: 522, name: "Numbness or tingling (panic)", cat: "Other" },
  { id: 523, name: "Chills or hot flashes (panic)", cat: "Other" },
  { id: 524, name: "Fear of losing control", cat: "Other" },
  { id: 525, name: "Fear of dying", cat: "Other" },
  { id: 526, name: "Feeling detached from oneself", cat: "Other" },
  { id: 527, name: "Feeling detached from reality", cat: "Other" },
  { id: 528, name: "Avoidance of situations that trigger anxiety", cat: "Other" },
  { id: 529, name: "Compulsive hand washing", cat: "Other" },
  { id: 530, name: "Checking rituals", cat: "Other" },
  { id: 531, name: "Counting rituals", cat: "Other" },
  { id: 532, name: "Ordering or arranging rituals", cat: "Other" },
  { id: 533, name: "Repetitive thoughts or images", cat: "Other" },
  { id: 534, name: "Fear of contamination", cat: "Other" },
  { id: 535, name: "Fear of making mistakes", cat: "Other" },
  { id: 536, name: "Excessive worry", cat: "Other" },
  { id: 537, name: "Difficulty relaxing", cat: "Other" },
  { id: 538, name: "Muscle tension (general)", cat: "Other" },
  { id: 539, name: "Irritability (general)", cat: "Other" },
  { id: 540, name: "Difficulty concentrating (general)", cat: "Other" },
  { id: 541, name: "Sleep disturbance (general)", cat: "Other" },
  { id: 542, name: "Nausea (general)", cat: "Other" },
  { id: 543, name: "Headaches (general)", cat: "Other" },
  { id: 544, name: "Fatigue (general)", cat: "Other" },
  { id: 545, name: "Chest pain (general)", cat: "Other" },
  { id: 546, name: "Shortness of breath (general)", cat: "Other" },
  { id: 547, name: "Dizziness (general)", cat: "Other" },
  { id: 548, name: "Numbness (general)", cat: "Other" },
  { id: 549, name: "Tingling (general)", cat: "Other" },
  { id: 550, name: "Weakness (general)", cat: "Other" },
  { id: 551, name: "Tremors (general)", cat: "Other" },
  { id: 552, name: "Difficulty walking (general)", cat: "Other" },
  { id: 553, name: "Loss of balance (general)", cat: "Other" },
  { id: 554, name: "Slurred speech (general)", cat: "Other" },
  { id: 555, name: "Difficulty swallowing (general)", cat: "Other" },
  { id: 556, name: "Vision changes (general)", cat: "Other" },
  { id: 557, name: "Hearing changes (general)", cat: "Other" },
  { id: 558, name: "Loss of taste (general)", cat: "Other" },
  { id: 559, name: "Loss of smell (general)", cat: "Other" },
  { id: 560, name: "Changes in appetite (general)", cat: "Other" },
  { id: 561, name: "Changes in weight (general)", cat: "Other" },
  { id: 562, name: "Increased thirst (general)", cat: "Other" },
  { id: 563, name: "Frequent urination (general)", cat: "Other" },
  { id: 564, name: "Skin rash (general)", cat: "Other" },
  { id: 565, name: "Itching (general)", cat: "Other" },
  { id: 566, name: "Dry skin (general)", cat: "Other" },
  { id: 567, name: "Bruising (general)", cat: "Other" },
  { id: 568, name: "Swelling (general)", cat: "Other" },
  { id: 569, name: "Painful urination (general)", cat: "Other" },
  { id: 570, name: "Blood in urine (general)", cat: "Other" },
  { id: 571, name: "Difficulty controlling bladder", cat: "Other" },
  { id: 572, name: "Difficulty controlling bowels", cat: "Other" },
  { id: 573, name: "Rectal bleeding (general)", cat: "Other" },
  { id: 574, name: "Black stools (general)", cat: "Other" },
  { id: 575, name: "Abdominal pain (general)", cat: "Other" },
  { id: 576, name: "Heartburn (general)", cat: "Other" },
  { id: 577, name: "Bloating (general)", cat: "Other" },
  { id: 578, name: "Indigestion (general)", cat: "Other" },
  { id: 579, name: "Nausea (general)", cat: "Other" },
  { id: 580, name: "Vomiting (general)", cat: "Other" },
  { id: 581, name: "Diarrhea (general)", cat: "Other" },
  { id: 582, name: "Constipation (general)", cat: "Other" },
  { id: 583, name: "Chest pain (general)", cat: "Other" },
  { id: 584, name: "Palpitations (general)", cat: "Other" },
  { id: 585, name: "Shortness of breath (general)", cat: "Other" },
  { id: 586, name: "Swelling in legs (general)", cat: "Other" },
  { id: 587, name: "Dizziness (general)", cat: "Other" },
  { id: 588, name: "Lightheadedness (general)", cat: "Other" },
  { id: 589, name: "Fainting (general)", cat: "Other" },
  { id: 590, name: "Weakness (general)", cat: "Other" },
  { id: 591, name: "Fatigue (general)", cat: "Other" },
  { id: 592, name: "Chills (general)", cat: "Other" },
  { id: 593, name: "Night sweats (general)", cat: "Other" },
  { id: 594, name: "Fever (general)", cat: "Other" },
  { id: 595, name: "Loss of appetite (general)", cat: "Other" },
  { id: 596, name: "Weight loss (general)", cat: "Other" },
  { id: 597, name: "Malaise (general)", cat: "Other" },
  { id: 598, name: "Generalized aches (general)", cat: "Other" },
  { id: 599, name: "Difficulty sleeping (general)", cat: "Other" },
  { id: 600, name: "Feeling unwell (general)", cat: "Other" },
];


// Compact Dropdown with reduced height
const SymptomDropdown = ({ value, onChange, placeholder = "Search or select symptom..." }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = SYMPTOMS_DB.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cat.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position to avoid clipping
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 160; // Reduced from 256px to 160px (max-h-40)
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('above');
      } else {
        setDropdownPosition('below');
      }
    }
  }, [isOpen]);

  const grouped = filtered.reduce((acc, symptom) => {
    if (!acc[symptom.cat]) acc[symptom.cat] = [];
    acc[symptom.cat].push(symptom);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value || search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {value && (
            <button
              onClick={() => { onChange(""); setSearch(""); setIsOpen(false); }}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[9999] w-full ${
          dropdownPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
        } bg-white rounded-xl shadow-2xl border border-gray-100 max-h-40 overflow-y-auto`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}>
          {Object.keys(grouped).length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              No symptoms found. You can still type your own.
            </div>
          ) : (
            Object.entries(grouped).map(([category, symptoms]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0 z-10">
                  {category}
                </div>
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => {
                      onChange(symptom.name);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-3 py-2 text-left text-gray-900 hover:bg-blue-50 active:bg-blue-100 transition-colors text-sm"
                  >
                    {symptom.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Severity Badge Component
const SeverityBadge = ({ severity, onChange }: {
  severity: "mild" | "moderate" | "severe";
  onChange: (severity: "mild" | "moderate" | "severe") => void;
}) => {
  const severityOptions = [
    { value: "mild" as const, label: "Mild", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "moderate" as const, label: "Moderate", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "severe" as const, label: "Severe", color: "bg-red-100 text-red-800 border-red-200" }
  ];

  return (
    <div className="flex space-x-2">
      {severityOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
            severity === option.value 
              ? option.color 
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Main Component
const SymptomsSection: React.FC<SymptomsSectionProps> = ({ 
  symptoms = [], 
  onChange = () => {} 
}) => {
  const addSymptom = () => {
    const newSymptom: Symptom = {
      id: Date.now(),
      name: "",
      severity: "moderate"
    };
    onChange([...symptoms, newSymptom]);
  };

  const removeSymptom = (index: number) => {
    if (symptoms.length > 1) {
      onChange(symptoms.filter((_, i) => i !== index));
    }
  };

  const updateSymptom = (index: number, field: keyof Symptom, value: any) => {
    const updated = symptoms.map((symptom, i) => {
      if (i === index) {
        return { ...symptom, [field]: value };
      }
      return symptom;
    });
    onChange(updated);
  };

  // Initialize with one symptom if empty
  useEffect(() => {
    if (symptoms.length === 0) {
      const initialSymptom: Symptom = {
        id: Date.now(),
        name: "",
        severity: "moderate"
      };
      onChange([initialSymptom]);
    }
  }, [symptoms.length, onChange]);

  return (
    <div className="space-y-4 relative p-4">
      <div className="space-y-4">
        {symptoms.map((symptom, index) => (
          <div key={symptom.id || index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Symptom {index + 1}</h4>
              {symptoms.length > 1 && (
                <button
                  onClick={() => removeSymptom(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Symptom Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptom Name
              </label>
              <SymptomDropdown
                value={symptom.name || ""}
                onChange={(value) => updateSymptom(index, "name", value)}
                placeholder="Search or type symptom name..."
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Severity Level
              </label>
              <SeverityBadge
                severity={symptom.severity}
                onChange={(value) => updateSymptom(index, "severity", value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={addSymptom}
        className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add Another Symptom</span>
      </button>

      {/* Summary */}
      {symptoms.length > 0 && symptoms.some(s => s.name) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
          <div className="space-y-1">
            {symptoms
              .filter(s => s.name)
              .map((symptom, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{symptom.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    symptom.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    symptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {symptom.severity}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomsSection;