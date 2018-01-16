var greenSchema = {
"optypes" : [
		"GA Advancement Hap",
		"GA Altmeyer/delormes (spesifiseres i info)",
		"GA Analfistel (behov for scopi i info)",
		"GA Annet inngrep (spesifiseres i info)",
		"GA Appendectomi, laparoscopi",
		"GA Appendectomi, laparotomi",
		"GA Brokk, lyske-åpen (angi side/bilat)",
		"GA Brokk, lyske-TEP (angi side/bilat)",
		"GA Brokk, ventral-laparoskopi (angi lokalisasjon/leiring)",
		"GA Brokk, ventral-åpen (angi lokalisasjon snittfæring)",
		"GA Cholecystectomi-laparoskopi",
		"GA Cholecystectomi-åpen",
		"GA Choledocolithotomi",
		"GA Cåling (duodenal, milt)",
		"GA Colectomi-laparoskopi"
	],
"sections" : [{
		"title" : "Opplysninger fra operatør",
		"rows" : [
			{
				"label" : "AB profylakse",
				"type" : "select",
				"values" : ["Dalacin 600 mg x 3", "Diclocil 500 mg", "Doxycyclin 400 mg", 
					"Doxycyclin 600 mg + Flagyl 2 g", "Doxycyclin 400 mg + Flagyl 1000 mg", 
					"Doxycyclin 400 mg + Flagyl 1500 mg", "Flagyl 1 g", "Flagyl 1,5 g"]
			},
			{
				"label" : "Tromboseprofylakse",
				"type" : "select",
				"values" : ["Keflin 2 g x 2", "Keflin 2 g x 3", "Keflin 2 g x 4", "Keflin 50 mg / pr kg x 1", 
					"Penicillin 4 mill hver 6 t x 3 fra oprstart", "Septim 2 amp x 2 i.v. (Trimetroprim sulfa)", 
					"Zinaref (cefuroksim) 1,5 g + Flagyl 1,5 g i.v.)"]
			},
			{
				"label" : "Smittestatus",
				"type" : "freeform"
			},
			{
				"label" : "Operasjonsleie",
				"type" : "freeform"
			},
			{
				"label" : "Operasjonsfelt",
				"type" : "select",
				"values" : ["dxt", "sin"]
			},
			{
				"label" : "Høyde (cm)",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "height"
			},
			{
				"label" : "Vekt (kg)",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "weight"
			},
			{
				"label" : "BMI",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "bmi"
			},
			{
				"label" : "Systolisk blodtrykk (mmHg)",
				"label_mini" : "Sist.BT",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "bp_high"
			},
			{
				"label" : "Diastolisk blodtrykk (mmHg)",
				"label_mini" : "Diast.BT",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "bp_low"
			},
			{
				"label" : "Puls",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "pulse"
			},
			{
				"label" : "Temp °C",
				"type" : "freeform",
				"extract" : "measure",
				"tag" : "temp"
			},
			{
				"label" : "Allergi",
				"type" : "freeform",
				"extract" : "other",
				"tag" : "allergy"
			},
			{
				"label" : "Hjertefunksjon",
				"type" : "freeform"
			},
			{
				"label" : "Lungefunksjon",
				"type" : "freeform"
			},
			{
				"label" : "Nyrefunksjon",
				"type" : "freeform"
			},
			{
				"label" : "Mental funksjon",
				"type" : "freeform"
			},
			{
				"label" : "Medikasjon",
				"type" : "freeform"
			}
		]
	}, {
		"title" : "Fylles ut av anestesipersonell",
		"rows" : [
			{
				"label" : "Vurdering ved",
				"type" : "freeform"
			},	
			{
				"label" : "ASA",
				"type" : "select",
				"values" : ["1", "2", "3", "4", "5"],
				"extract" : "measure",
				"tag" : "asa"
			},
			{
				"label" : "Planl. Luftvei",
				"type" : "freeform"
			},
			{
				"label" : "Angina",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Infarkt",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Klaffefeil",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Arytmi",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Hjertesvikt",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Karsykdom",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Hypertoni",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Røyking",
				"type" : "select",
				"values" : ["Ja", "Nei"],
				"extract" : "other",
				"tag" : "smoking"
			},
			{
				"label" : "Kols/Astma",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Asp.risiko",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Nevr.sykdom",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Nyresvikt",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Endokr. Sd",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Anemi",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Hypovolemi",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Res. Lungesyk",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Væs/el forst",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Adipositas",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Psyk.sd",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Malign sd",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "CVK",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "A-kran",
				"type" : "select",
				"values" : ["Ja", "Nei"]
			},
			{
				"label" : "Allergi",
				"type" : "freeform",
				"extract" : "other",
				"tag" : "allergy"
			},
			{
				"label" : "Tannstatus",
				"type" : "freeform"
			},
			{
				"label" : "Nakke",
				"type" : "freeform"
			},
			{
				"label" : "Gap/kjeve",
				"type" : "freeform"
			},
			{
				"label" : "Premedikasjon",
				"type" : "freeform"
			},
			{
				"label" : "Morgenmedikasjon",
				"type" : "freeform"
			},
			{
				"label" : "Annen info. fra anestesi",
				"type" : "freeform"
			}
		]
	}, {
		"title" : "Ressurser og operasjonsinformasjon",
		"rows" : [
			{
				"label" : "Team",
				"type" : "freeform"
			},
			{
				"label" : "Operasjonsstue",
				"type" : "freeform"
			},
			{
				"label" : "Hovedoperatør",
				"type" : "freeform"
			},
			{
				"label" : "Ass. opertør 1",
				"type" : "freeform"
			},
			{
				"label" : "Ass. opertør 1",
				"type" : "freeform"
			},
			{
				"label" : "Ass. opertør 2",
				"type" : "freeform"
			},
			{
				"label" : "Operasjsonsspl.",
				"type" : "freeform"
			},
			{
				"label" : "Anestesilege",
				"type" : "freeform"
			},
			{
				"label" : "Anestesispl.",
				"type" : "freeform"
			}
		]
	}]
};