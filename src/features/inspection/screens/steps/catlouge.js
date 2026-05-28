{
    "success": true,
    "version": "1.2.3",
    "message": "Inspection options catalog retrieved successfully",
    "view": "tree",
    "sections": 6,
    "data": [
        {
            "section": "airConditioning",
            "label": "Air Conditioning",
            "children": [
                {
                    "type": "group",
                    "key": "coolingPerformance",
                    "label": "Cooling Performance",
                    "path": "airConditioning.coolingPerformance",
                    "section": "airConditioning",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "acCompressor",
                            "label": "Ac Compressor",
                            "path": "airConditioning.coolingPerformance.acCompressor",
                            "section": "airConditioning",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "airConditioning.coolingPerformance.acCompressor.issues",
                                    "section": "airConditioning",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "AC Compressor not working",
                                                    "label": "AC Compressor not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Compressor noise",
                                                    "label": "Compressor noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "acControlPanel",
                            "label": "Ac Control Panel",
                            "path": "airConditioning.coolingPerformance.acControlPanel",
                            "section": "airConditioning",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "airConditioning.coolingPerformance.acControlPanel.issues",
                                    "section": "airConditioning",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "AC Panel broken/Crack",
                                                    "label": "AC Panel broken/Crack",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "AC Panel display not working",
                                                    "label": "AC Panel display not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "acCooling",
                            "label": "Ac Cooling",
                            "path": "airConditioning.coolingPerformance.acCooling",
                            "section": "airConditioning",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "airConditioning.coolingPerformance.acCooling.issues",
                                    "section": "airConditioning",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Ineffective - 12°C to 18°C",
                                                    "label": "Ineffective - 12°C to 18°C",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not working 18°C and above",
                                                    "label": "Not working 18°C and above",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not available",
                                                    "label": "Not available",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "airflow & ventilation",
                    "label": "Airflow & Ventilation",
                    "path": "airConditioning.airflow & ventilation",
                    "section": "airConditioning",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "blowerMotor",
                            "label": "Blower Motor",
                            "path": "airConditioning.airflow & ventilation.blowerMotor",
                            "section": "airConditioning",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "airConditioning.airflow & ventilation.blowerMotor.issues",
                                    "section": "airConditioning",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Blower Motor noisy",
                                                    "label": "Blower Motor noisy",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Blower Motor Not working",
                                                    "label": "Blower Motor Not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "field",
                            "key": "isClimateControlAvailable",
                            "label": "is Climate Control Available",
                            "path": "airConditioning.airflow & ventilation.isClimateControlAvailable",
                            "section": "airConditioning",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "group",
                            "key": "ventilationSystem",
                            "label": "Ventilation System",
                            "path": "airConditioning.airflow & ventilation.ventilationSystem",
                            "section": "airConditioning",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "airConditioning.airflow & ventilation.ventilationSystem.issues",
                                    "section": "airConditioning",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "section": "electricalsInteriors",
            "label": "Electricals Interiors",
            "children": [
                {
                    "type": "group",
                    "key": "Doors",
                    "label": "Doors",
                    "path": "electricalsInteriors.Doors",
                    "section": "electricalsInteriors",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "frontLeftWindow",
                            "label": "front Left Window",
                            "path": "electricalsInteriors.Doors.frontLeftWindow",
                            "section": "electricalsInteriors",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "electricalsInteriors/Doors/frontLeftWindow/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "electricalsInteriors.Doors.frontLeftWindow.issues",
                                    "section": "electricalsInteriors",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Broken Switch",
                                                    "label": "Broken Switch",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "frontRightWindow",
                            "label": "front Right Window",
                            "path": "electricalsInteriors.Doors.frontRightWindow",
                            "section": "electricalsInteriors",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "electricalsInteriors/Doors/frontRightWindow/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "electricalsInteriors.Doors.frontRightWindow.issues",
                                    "section": "electricalsInteriors",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Broken Switch",
                                                    "label": "Broken Switch",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lockSystem",
                            "label": "Lock System",
                            "path": "electricalsInteriors.Doors.lockSystem",
                            "section": "electricalsInteriors",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "electricalsInteriors.Doors.lockSystem.issues",
                                    "section": "electricalsInteriors",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Remote & Standard Key Non Functional/Damaged",
                                                    "label": "Remote & Standard Key Non Functional/Damaged",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Central Lock Not Working",
                                                    "label": "Central Lock Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "field",
                            "key": "powerWindows",
                            "label": "power Windows",
                            "path": "electricalsInteriors.Doors.powerWindows",
                            "section": "electricalsInteriors",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "NUMBER",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": 0,
                                            "label": "0",
                                            "dataType": "NUMBER",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": 2,
                                            "label": "2",
                                            "dataType": "NUMBER",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": 4,
                                            "label": "4",
                                            "dataType": "NUMBER",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "Accessories",
                    "label": "Accessories",
                    "path": "electricalsInteriors.Accessories",
                    "section": "electricalsInteriors",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "musicSystem",
                            "label": "Music System",
                            "path": "electricalsInteriors.Accessories.musicSystem",
                            "section": "electricalsInteriors",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "isPresent",
                                    "label": "is Present",
                                    "path": "electricalsInteriors.Accessories.musicSystem.isPresent",
                                    "section": "electricalsInteriors",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "BOOLEAN",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": true,
                                                    "label": "true",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Video",
                                                            "label": "Video",
                                                            "dataType": "STRING",
                                                            "inputType": "file-upload",
                                                            "subOptions2": [],
                                                            "uploadPath": "electricalsInteriors/Accessories/musicSystem/isPresent/video"
                                                        },
                                                        {
                                                            "value": "issues",
                                                            "label": "Issues",
                                                            "dataType": "STRING",
                                                            "inputType": "multi-select",
                                                            "subOptions2": [
                                                                {
                                                                    "value": "Music system not working",
                                                                    "label": "Music system not working",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Touch not working",
                                                                    "label": "Touch not working",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Buttons not working",
                                                                    "label": "Buttons not working",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Touch screen broken/cracked",
                                                                    "label": "Touch screen broken/cracked",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Mouth/Face Plate Missing",
                                                                    "label": "Mouth/Face Plate Missing",
                                                                    "dataType": "STRING"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": false,
                                                    "label": "false",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "sunroof",
                            "label": "Sunroof",
                            "path": "electricalsInteriors.Accessories.sunroof",
                            "section": "electricalsInteriors",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "isAvailable",
                                    "label": "is Available",
                                    "path": "electricalsInteriors.Accessories.sunroof.isAvailable",
                                    "section": "electricalsInteriors",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "BOOLEAN",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": true,
                                                    "label": "true",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Image",
                                                            "label": "Image",
                                                            "dataType": "STRING",
                                                            "inputType": "file-upload",
                                                            "subOptions2": [],
                                                            "uploadPath": "electricalsInteriors/Accessories/sunroof/isAvailable/image"
                                                        },
                                                        {
                                                            "value": "issues",
                                                            "label": "Issues",
                                                            "dataType": "STRING",
                                                            "inputType": "multi-select",
                                                            "subOptions2": [
                                                                {
                                                                    "value": "Sunroof Not Opening",
                                                                    "label": "Sunroof Not Opening",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Sunroof Not Closing",
                                                                    "label": "Sunroof Not Closing",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Sunroof Motor Not Working",
                                                                    "label": "Sunroof Motor Not Working",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Water Leakage",
                                                                    "label": "Water Leakage",
                                                                    "dataType": "STRING"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": false,
                                                    "label": "false",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "section": "engineTransmission",
            "label": "Engine Transmission",
            "children": [
                {
                    "type": "group",
                    "key": "engineImage",
                    "label": "Engine Image",
                    "path": "engineTransmission.engineImage",
                    "section": "engineTransmission",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "batteryAlternator",
                            "label": "battery Alternator",
                            "path": "engineTransmission.engineImage.batteryAlternator",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineImage/batteryAlternator/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineImage.batteryAlternator.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Weak",
                                                    "label": "Weak",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Dead/Jump start required",
                                                    "label": "Dead/Jump start required",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Discharging light glow/Alternator not working",
                                                    "label": "Discharging light glow/Alternator not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Damaged/Leakage",
                                                    "label": "Damaged/Leakage",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Battery not available",
                                                    "label": "Battery not available",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "coolant",
                            "label": "coolant",
                            "path": "engineTransmission.engineImage.coolant",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineImage/coolant/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineImage.coolant.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Leaking",
                                                    "label": "Leaking",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Dirty",
                                                    "label": "Dirty",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Level low",
                                                    "label": "Level low",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Coolant mixed with engine oil",
                                                    "label": "Coolant mixed with engine oil",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "engineOil",
                            "label": "engine Oil",
                            "path": "engineTransmission.engineImage.engineOil",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineImage/engineOil/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineImage.engineOil.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Dipstick damaged/missing",
                                                    "label": "Dipstick damaged/missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Low engine oil level",
                                                    "label": "Low engine oil level",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Engine oil leaking",
                                                    "label": "Engine oil leaking",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Engine oil dirty",
                                                    "label": "Engine oil dirty",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Leakage from Tappet Cover",
                                                    "label": "Leakage from Tappet Cover",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Leakage from Timing Side Cover",
                                                    "label": "Leakage from Timing Side Cover",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Coolant mixed with engine oil",
                                                    "label": "Coolant mixed with engine oil",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "sump",
                            "label": "sump",
                            "path": "engineTransmission.engineImage.sump",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineImage/sump/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineImage.sump.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Leakage from Sump/Chamber",
                                                    "label": "Leakage from Sump/Chamber",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "engineSoundTest",
                    "label": "Engine Sound Test",
                    "path": "engineTransmission.engineSoundTest",
                    "section": "engineTransmission",
                    "inputs": [],
                    "children": [
                        {
                            "type": "field",
                            "key": "obdConnection",
                            "label": "obd Connection",
                            "path": "engineTransmission.engineSoundTest.obdConnection",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/obdConnection/image"
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "group",
                            "key": "blowBy2000rpm",
                            "label": "blow By2000rpm",
                            "path": "engineTransmission.engineSoundTest.blowBy2000rpm",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/blowBy2000rpm/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineSoundTest.blowBy2000rpm.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Blow-by on 2000 RPM",
                                                    "label": "Blow-by on 2000 RPM",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Oil spillage on 2000 RPM",
                                                    "label": "Oil spillage on 2000 RPM",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Blow-by & oil spillage on 2000 RPM",
                                                    "label": "Blow-by & oil spillage on 2000 RPM",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "blowByIdle",
                            "label": "blow By Idle",
                            "path": "engineTransmission.engineSoundTest.blowByIdle",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/blowByIdle/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineSoundTest.blowByIdle.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Permissible blow by on idle",
                                                    "label": "Permissible blow by on idle",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Oil spillage on idle",
                                                    "label": "Oil spillage on idle",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Permissible Blow by & oil spillage on idle",
                                                    "label": "Permissible Blow by & oil spillage on idle",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "exhaustSmoke",
                            "label": "exhaust Smoke",
                            "path": "engineTransmission.engineSoundTest.exhaustSmoke",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/exhaustSmoke/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineSoundTest.exhaustSmoke.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Black",
                                                    "label": "Black",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Blue",
                                                    "label": "Blue",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "White",
                                                    "label": "White",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Silencer assembly damaged",
                                                    "label": "Silencer assembly damaged",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Noise from silencer assembly",
                                                    "label": "Noise from silencer assembly",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Catalytic convertor missing",
                                                    "label": "Catalytic convertor missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "fuelInjector",
                            "label": "fuel Injector",
                            "path": "engineTransmission.engineSoundTest.fuelInjector",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/fuelInjector/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineSoundTest.fuelInjector.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Fuel Injector noise",
                                                    "label": "Fuel Injector noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Leakage from Fuel Injector or manifold",
                                                    "label": "Leakage from Fuel Injector or manifold",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "radiator",
                            "label": "radiator",
                            "path": "engineTransmission.engineSoundTest.radiator",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/radiator/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engineSoundTest.radiator.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Radiator damaged",
                                                    "label": "Radiator damaged",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Radiator fan not working",
                                                    "label": "Radiator fan not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Radiator fan motor noise",
                                                    "label": "Radiator fan motor noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "turbocharger",
                            "label": "turbocharger",
                            "path": "engineTransmission.engineSoundTest.turbocharger",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engineSoundTest/turbocharger/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "isAvailable",
                                    "label": "is Available",
                                    "path": "engineTransmission.engineSoundTest.turbocharger.isAvailable",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "BOOLEAN",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": true,
                                                    "label": "true",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": [
                                                        {
                                                            "value": "issues",
                                                            "label": "Issues",
                                                            "dataType": "STRING",
                                                            "inputType": "multi-select",
                                                            "subOptions2": [
                                                                {
                                                                    "value": "Turbocharger whistling noise",
                                                                    "label": "Turbocharger whistling noise",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Turbocharger Not working",
                                                                    "label": "Turbocharger Not working",
                                                                    "dataType": "STRING"
                                                                },
                                                                {
                                                                    "value": "Leakage",
                                                                    "label": "Leakage",
                                                                    "dataType": "STRING"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": false,
                                                    "label": "false",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "engine",
                    "label": "Engine",
                    "path": "engineTransmission.engine",
                    "section": "engineTransmission",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "clutch",
                            "label": "clutch",
                            "path": "engineTransmission.engine.clutch",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engine/clutch/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engine.clutch.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Hard",
                                                    "label": "Hard",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Spongy",
                                                    "label": "Spongy",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Burning",
                                                    "label": "Burning",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Bearing noise",
                                                    "label": "Bearing noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Slip/low pickup",
                                                    "label": "Slip/low pickup",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "transmissionType",
                                    "label": "transmission Type",
                                    "path": "engineTransmission.engine.clutch.transmissionType",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "Manual",
                                                    "label": "Manual",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Automatic",
                                                    "label": "Automatic",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "engineCondition",
                            "label": "engine Condition",
                            "path": "engineTransmission.engine.engineCondition",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engine/engineCondition/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engine.engineCondition.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "RPM fluctuating",
                                                    "label": "RPM fluctuating",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Over heating",
                                                    "label": "Over heating",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Misfiring",
                                                    "label": "Misfiring",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "MIL light glowing",
                                                    "label": "MIL light glowing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Long cranking due to weak compression",
                                                    "label": "Long cranking due to weak compression",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Air filter box damaged",
                                                    "label": "Air filter box damaged",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Electrical wiring damaged",
                                                    "label": "Electrical wiring damaged",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not converting to CNG/LPG",
                                                    "label": "Not converting to CNG/LPG",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Car not working on Petrol",
                                                    "label": "Car not working on Petrol",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Low pickup due to engine performance",
                                                    "label": "Low pickup due to engine performance",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "RPM not increasing",
                                                    "label": "RPM not increasing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Low pressure warning light glowing",
                                                    "label": "Low pressure warning light glowing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Idle Start Stop Not Working",
                                                    "label": "Idle Start Stop Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "engineMounting",
                            "label": "engine Mounting",
                            "path": "engineTransmission.engine.engineMounting",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engine/engineMounting/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engine.engineMounting.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Broken",
                                                    "label": "Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Excess Vibration",
                                                    "label": "Excess Vibration",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "severity",
                                    "label": "severity",
                                    "path": "engineTransmission.engine.engineMounting.severity",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "Minor",
                                                    "label": "Minor",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Critical",
                                                    "label": "Critical",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "transmissionGearShifting",
                            "label": "transmission Gear Shifting",
                            "path": "engineTransmission.engine.transmissionGearShifting",
                            "section": "engineTransmission",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "engineTransmission/engine/transmissionGearShifting/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.engine.transmissionGearShifting.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Gear Shifting Hard",
                                                    "label": "Gear Shifting Hard",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "1st Gear Not Engaging",
                                                    "label": "1st Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "2nd Gear Not Engaging",
                                                    "label": "2nd Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "3rd Gear Not Engaging",
                                                    "label": "3rd Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4th Gear Not Engaging",
                                                    "label": "4th Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "5th Gear Not Engaging",
                                                    "label": "5th Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "6th Gear Not Engaging",
                                                    "label": "6th Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Reverse Gear Not Engaging",
                                                    "label": "Reverse Gear Not Engaging",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Abnormal noise while shifting",
                                                    "label": "Abnormal noise while shifting",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Automatic transmission not working properly",
                                                    "label": "Automatic transmission not working properly",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Automatic Transmission MIL light glowing",
                                                    "label": "Automatic Transmission MIL light glowing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4WD/AWD not working",
                                                    "label": "4WD/AWD not working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Gear box abnormal noise",
                                                    "label": "Gear box abnormal noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Gearbox oil leakage",
                                                    "label": "Gearbox oil leakage",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Front drive axle noise",
                                                    "label": "Front drive axle noise",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "roadTest",
                    "label": "road Test",
                    "path": "engineTransmission.roadTest",
                    "section": "engineTransmission",
                    "inputs": [
                        {
                            "inputType": "file-upload",
                            "dataType": "STRING",
                            "allowsMultiple": true,
                            "options": [
                                {
                                    "value": "Image",
                                    "label": "Image",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "engineTransmission/roadTest/image"
                                }
                            ]
                        },
                        {
                            "inputType": "number",
                            "dataType": "NUMBER",
                            "allowsMultiple": false,
                            "options": [
                                {
                                    "value": "initialOdometer",
                                    "label": "Initial Odometer",
                                    "dataType": "NUMBER",
                                    "subOptions1": []
                                },
                                {
                                    "value": "finalOdometer",
                                    "label": "Final Odometer",
                                    "dataType": "NUMBER",
                                    "subOptions1": []
                                },
                                {
                                    "value": "distanceMeters",
                                    "label": "Distance Meters",
                                    "dataType": "NUMBER",
                                    "subOptions1": []
                                },
                                {
                                    "value": "durationMinutes",
                                    "label": "Duration Minutes",
                                    "dataType": "NUMBER",
                                    "subOptions1": []
                                }
                            ]
                        }
                    ],
                    "children": [
                        {
                            "type": "group",
                            "key": "runningCondition",
                            "label": "Running Condition",
                            "path": "engineTransmission.roadTest.runningCondition",
                            "section": "engineTransmission",
                            "inputs": [],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "isCarRunning",
                                    "label": "is Car Running",
                                    "path": "engineTransmission.roadTest.runningCondition.isCarRunning",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "BOOLEAN",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": true,
                                                    "label": "true",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": false,
                                                    "label": "false",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "engineTransmission.roadTest.runningCondition.issues",
                                    "section": "engineTransmission",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Car is not running condition, towing required",
                                                    "label": "Car is not running condition, towing required",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Engine is starting but Car is not in running condition and towing required",
                                                    "label": "Engine is starting but Car is not in running condition and towing required",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Car in running condition but towing suggested to avoid damage to engine",
                                                    "label": "Car in running condition but towing suggested to avoid damage to engine",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Car in running condition but towing suggested to avoid damage to clutch/transmission",
                                                    "label": "Car in running condition but towing suggested to avoid damage to clutch/transmission",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Tyre punctured",
                                                    "label": "Tyre punctured",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Seized",
                                                    "label": "Seized",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "section": "exterior",
            "label": "Exterior",
            "children": [
                {
                    "type": "group",
                    "key": "bodyPanels",
                    "label": "Body Panels",
                    "path": "exterior.bodyPanels",
                    "section": "exterior",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "bootFloor",
                            "label": "boot Floor",
                            "path": "exterior.bodyPanels.bootFloor",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/bootFloor/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.bootFloor.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "frontBumper",
                            "label": "front Bumper",
                            "path": "exterior.bodyPanels.frontBumper",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/frontBumper/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.frontBumper.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsA_Pillar",
                            "label": "lhs A Pillar",
                            "path": "exterior.bodyPanels.lhsA_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsA_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsA_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsB_Pillar",
                            "label": "lhs B Pillar",
                            "path": "exterior.bodyPanels.lhsB_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsB_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsB_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsC_Pillar",
                            "label": "lhs C Pillar",
                            "path": "exterior.bodyPanels.lhsC_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsC_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsC_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsFender",
                            "label": "lhs Fender",
                            "path": "exterior.bodyPanels.lhsFender",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsFender/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsFender.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsFrontDoor",
                            "label": "lhs Front Door",
                            "path": "exterior.bodyPanels.lhsFrontDoor",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsFrontDoor/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsFrontDoor.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsQuarterPanel",
                            "label": "lhs Quarter Panel",
                            "path": "exterior.bodyPanels.lhsQuarterPanel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsQuarterPanel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsQuarterPanel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged/Dented",
                                                    "label": "Damaged/Dented",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsRearDoor",
                            "label": "lhs Rear Door",
                            "path": "exterior.bodyPanels.lhsRearDoor",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsRearDoor/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsRearDoor.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsRunningBorder",
                            "label": "lhs Running Border",
                            "path": "exterior.bodyPanels.lhsRunningBorder",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/lhsRunningBorder/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.lhsRunningBorder.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged/Dented",
                                                    "label": "Damaged/Dented",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rearBumper",
                            "label": "rear Bumper",
                            "path": "exterior.bodyPanels.rearBumper",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rearBumper/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rearBumper.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsA_Pillar",
                            "label": "rhs A Pillar",
                            "path": "exterior.bodyPanels.rhsA_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsA_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsA_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsB_Pillar",
                            "label": "rhs B Pillar",
                            "path": "exterior.bodyPanels.rhsB_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsB_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsB_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsC_Pillar",
                            "label": "rhs C Pillar",
                            "path": "exterior.bodyPanels.rhsC_Pillar",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsC_Pillar/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsC_Pillar.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsFender",
                            "label": "rhs Fender",
                            "path": "exterior.bodyPanels.rhsFender",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsFender/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsFender.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsFrontDoor",
                            "label": "rhs Front Door",
                            "path": "exterior.bodyPanels.rhsFrontDoor",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsFrontDoor/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsFrontDoor.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsQuarterPanel",
                            "label": "rhs Quarter Panel",
                            "path": "exterior.bodyPanels.rhsQuarterPanel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsQuarterPanel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsQuarterPanel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged/Dented",
                                                    "label": "Damaged/Dented",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsRearDoor",
                            "label": "rhs Rear Door",
                            "path": "exterior.bodyPanels.rhsRearDoor",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsRearDoor/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsRearDoor.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Opening",
                                                    "label": "Not Opening",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsRunningBorder",
                            "label": "rhs Running Border",
                            "path": "exterior.bodyPanels.rhsRunningBorder",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/rhsRunningBorder/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.rhsRunningBorder.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged/Dented",
                                                    "label": "Damaged/Dented",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "roof",
                            "label": "roof",
                            "path": "exterior.bodyPanels.roof",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/bodyPanels/roof/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.bodyPanels.roof.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "lightsGlass",
                    "label": "Lights Glass",
                    "path": "exterior.lightsGlass",
                    "section": "exterior",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "frontWindshield",
                            "label": "front Windshield",
                            "path": "exterior.lightsGlass.frontWindshield",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/frontWindshield/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.frontWindshield.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Cracked",
                                                    "label": "Cracked",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Moisture",
                                                    "label": "Moisture",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsFogLight",
                            "label": "lhs Fog Light",
                            "path": "exterior.lightsGlass.lhsFogLight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/lhsFogLight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.lhsFogLight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsHeadlight",
                            "label": "lhs Headlight",
                            "path": "exterior.lightsGlass.lhsHeadlight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/lhsHeadlight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.lhsHeadlight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsTailLight",
                            "label": "lhs Tail Light",
                            "path": "exterior.lightsGlass.lhsTailLight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/lhsTailLight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.lhsTailLight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rearWindshield",
                            "label": "rear Windshield",
                            "path": "exterior.lightsGlass.rearWindshield",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/rearWindshield/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "defoggerWorking",
                                    "label": "defogger Working",
                                    "path": "exterior.lightsGlass.rearWindshield.defoggerWorking",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "BOOLEAN",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": true,
                                                    "label": "true",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": false,
                                                    "label": "false",
                                                    "dataType": "BOOLEAN",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.rearWindshield.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Cracked",
                                                    "label": "Cracked",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsFogLight",
                            "label": "rhs Fog Light",
                            "path": "exterior.lightsGlass.rhsFogLight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/rhsFogLight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.rhsFogLight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsHeadlight",
                            "label": "rhs Headlight",
                            "path": "exterior.lightsGlass.rhsHeadlight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/rhsHeadlight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.rhsHeadlight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsTailLight",
                            "label": "rhs Tail Light",
                            "path": "exterior.lightsGlass.rhsTailLight",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/lightsGlass/rhsTailLight/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.lightsGlass.rhsTailLight.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Moisture in light",
                                                    "label": "Moisture in light",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Faded",
                                                    "label": "Faded",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "orvm",
                    "label": "Orvm",
                    "path": "exterior.orvm",
                    "section": "exterior",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "lhs",
                            "label": "lhs",
                            "path": "exterior.orvm.lhs",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/orvm/lhs/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.orvm.lhs.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Mirror Broken/Cracked",
                                                    "label": "Mirror Broken/Cracked",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Folding Motor Not Working",
                                                    "label": "Folding Motor Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Mirror Motor Not Working",
                                                    "label": "Mirror Motor Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhs",
                            "label": "rhs",
                            "path": "exterior.orvm.rhs",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/orvm/rhs/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.orvm.rhs.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Scratched",
                                                    "label": "Scratched",
                                                    "dataType": "STRING",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Missing",
                                                    "label": "Missing",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not Working",
                                                    "label": "Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Mirror Broken/Cracked",
                                                    "label": "Mirror Broken/Cracked",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Folding Motor Not Working",
                                                    "label": "Folding Motor Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Mirror Motor Not Working",
                                                    "label": "Mirror Motor Not Working",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "structure",
                    "label": "Structure",
                    "path": "exterior.structure",
                    "section": "exterior",
                    "inputs": [],
                    "children": [
                        {
                            "type": "group",
                            "key": "firewall",
                            "label": "firewall",
                            "path": "exterior.structure.firewall",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/firewall/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.firewall.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "headlightSupport",
                            "label": "headlight Support",
                            "path": "exterior.structure.headlightSupport",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/headlightSupport/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.headlightSupport.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsApron",
                            "label": "lhs Apron",
                            "path": "exterior.structure.lhsApron",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/lhsApron/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.lhsApron.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lowerCrossMember",
                            "label": "lower Cross Member",
                            "path": "exterior.structure.lowerCrossMember",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/lowerCrossMember/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.lowerCrossMember.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "radiatorSupport",
                            "label": "radiator Support",
                            "path": "exterior.structure.radiatorSupport",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/radiatorSupport/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.radiatorSupport.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsApron",
                            "label": "rhs Apron",
                            "path": "exterior.structure.rhsApron",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/rhsApron/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.rhsApron.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Dented",
                                                    "label": "Dented",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Replaced",
                                                    "label": "Replaced",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repainted",
                                                    "label": "Repainted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sealant Missing/Broken",
                                                    "label": "Sealant Missing/Broken",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsApronLeg",
                            "label": "rhs Apron Leg",
                            "path": "exterior.structure.rhsApronLeg",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/rhsApronLeg/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.rhsApronLeg.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "upperCrossMember",
                            "label": "upper Cross Member",
                            "path": "exterior.structure.upperCrossMember",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/structure/upperCrossMember/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.structure.upperCrossMember.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Metal Eaten Rust",
                                                    "label": "Metal Eaten Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Surface Rust",
                                                    "label": "Surface Rust",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Damaged",
                                                    "label": "Damaged",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                },
                                                {
                                                    "value": "Repaired",
                                                    "label": "Repaired",
                                                    "dataType": "STRING",
                                                    "inputType": "select",
                                                    "subOptions1": [
                                                        {
                                                            "value": "Minor",
                                                            "label": "Minor",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Major",
                                                            "label": "Major",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        },
                                                        {
                                                            "value": "Severe",
                                                            "label": "Severe",
                                                            "dataType": "STRING",
                                                            "subOptions2": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "wheelsTyres",
                    "label": "Wheels Tyres",
                    "path": "exterior.wheelsTyres",
                    "section": "exterior",
                    "inputs": [],
                    "children": [
                        {
                            "type": "field",
                            "key": "alloyWheels",
                            "label": "alloy Wheels",
                            "path": "exterior.wheelsTyres.alloyWheels",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "jackAndToolsAvailable",
                            "label": "jack And Tools Available",
                            "path": "exterior.wheelsTyres.jackAndToolsAvailable",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "group",
                            "key": "lhsFrontWheel",
                            "label": "lhs Front Wheel",
                            "path": "exterior.wheelsTyres.lhsFrontWheel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/wheelsTyres/lhsFrontWheel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.wheelsTyres.lhsFrontWheel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Uneven Tread Wear",
                                                    "label": "Uneven Tread Wear",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sidewall Puncture/Cut/Bulge",
                                                    "label": "Sidewall Puncture/Cut/Bulge",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "tyreTreadDepth",
                                    "label": "tyre Tread Depth",
                                    "path": "exterior.wheelsTyres.lhsFrontWheel.tyreTreadDepth",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "0-1.6 mm",
                                                    "label": "0-1.6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "1.6-2 mm",
                                                    "label": "1.6-2 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "2-3 mm",
                                                    "label": "2-3 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "3-4 mm",
                                                    "label": "3-4 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4-5 mm",
                                                    "label": "4-5 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "5-6 mm",
                                                    "label": "5-6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "6-7 mm",
                                                    "label": "6-7 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "7+ mm",
                                                    "label": "7+ mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "lhsRearWheel",
                            "label": "lhs Rear Wheel",
                            "path": "exterior.wheelsTyres.lhsRearWheel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/wheelsTyres/lhsRearWheel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.wheelsTyres.lhsRearWheel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Uneven Tread Wear",
                                                    "label": "Uneven Tread Wear",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sidewall Puncture/Cut/Bulge",
                                                    "label": "Sidewall Puncture/Cut/Bulge",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "tyreTreadDepth",
                                    "label": "tyre Tread Depth",
                                    "path": "exterior.wheelsTyres.lhsRearWheel.tyreTreadDepth",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "0-1.6 mm",
                                                    "label": "0-1.6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "1.6-2 mm",
                                                    "label": "1.6-2 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "2-3 mm",
                                                    "label": "2-3 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "3-4 mm",
                                                    "label": "3-4 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4-5 mm",
                                                    "label": "4-5 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "5-6 mm",
                                                    "label": "5-6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "6-7 mm",
                                                    "label": "6-7 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "7+ mm",
                                                    "label": "7+ mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsFrontWheel",
                            "label": "rhs Front Wheel",
                            "path": "exterior.wheelsTyres.rhsFrontWheel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/wheelsTyres/rhsFrontWheel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.wheelsTyres.rhsFrontWheel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Uneven Tread Wear",
                                                    "label": "Uneven Tread Wear",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sidewall Puncture/Cut/Bulge",
                                                    "label": "Sidewall Puncture/Cut/Bulge",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "tyreTreadDepth",
                                    "label": "tyre Tread Depth",
                                    "path": "exterior.wheelsTyres.rhsFrontWheel.tyreTreadDepth",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "0-1.6 mm",
                                                    "label": "0-1.6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "1.6-2 mm",
                                                    "label": "1.6-2 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "2-3 mm",
                                                    "label": "2-3 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "3-4 mm",
                                                    "label": "3-4 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4-5 mm",
                                                    "label": "4-5 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "5-6 mm",
                                                    "label": "5-6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "6-7 mm",
                                                    "label": "6-7 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "7+ mm",
                                                    "label": "7+ mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "group",
                            "key": "rhsRearWheel",
                            "label": "rhs Rear Wheel",
                            "path": "exterior.wheelsTyres.rhsRearWheel",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "exterior/wheelsTyres/rhsRearWheel/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "exterior.wheelsTyres.rhsRearWheel.issues",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Uneven Tread Wear",
                                                    "label": "Uneven Tread Wear",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Sidewall Puncture/Cut/Bulge",
                                                    "label": "Sidewall Puncture/Cut/Bulge",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                },
                                {
                                    "type": "field",
                                    "key": "tyreTreadDepth",
                                    "label": "tyre Tread Depth",
                                    "path": "exterior.wheelsTyres.rhsRearWheel.tyreTreadDepth",
                                    "section": "exterior",
                                    "inputs": [
                                        {
                                            "inputType": "select",
                                            "dataType": "STRING",
                                            "allowsMultiple": false,
                                            "options": [
                                                {
                                                    "value": "0-1.6 mm",
                                                    "label": "0-1.6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "1.6-2 mm",
                                                    "label": "1.6-2 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "2-3 mm",
                                                    "label": "2-3 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "3-4 mm",
                                                    "label": "3-4 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "4-5 mm",
                                                    "label": "4-5 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "5-6 mm",
                                                    "label": "5-6 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "6-7 mm",
                                                    "label": "6-7 mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "7+ mm",
                                                    "label": "7+ mm",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "field",
                            "key": "spareTyrePresent",
                            "label": "spare Tyre Present",
                            "path": "exterior.wheelsTyres.spareTyrePresent",
                            "section": "exterior",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                }
            ]
        },
        {
            "section": "steeringBrakes",
            "label": "Steering Brakes",
            "children": [
                {
                    "type": "group",
                    "key": "brakes",
                    "label": "brakes",
                    "path": "steeringBrakes.brakes",
                    "section": "steeringBrakes",
                    "inputs": [
                        {
                            "inputType": "file-upload",
                            "dataType": "STRING",
                            "allowsMultiple": true,
                            "options": [
                                {
                                    "value": "Image",
                                    "label": "Image",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "steeringBrakes/brakes/image"
                                }
                            ]
                        }
                    ],
                    "children": [
                        {
                            "type": "field",
                            "key": "issues",
                            "label": "issues",
                            "path": "steeringBrakes.brakes.issues",
                            "section": "steeringBrakes",
                            "inputs": [
                                {
                                    "inputType": "multi-select",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Ineffective",
                                            "label": "Ineffective",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Noisy",
                                            "label": "Noisy",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Master Cylinder Leaking",
                                            "label": "Master Cylinder Leaking",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Wheel Cylinder Leaking",
                                            "label": "Wheel Cylinder Leaking",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Hand Brake Light Glowing",
                                            "label": "Hand Brake Light Glowing",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Brake Oil Cap Missing",
                                            "label": "Brake Oil Cap Missing",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Vibration",
                                            "label": "Vibration",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "steering",
                    "label": "steering",
                    "path": "steeringBrakes.steering",
                    "section": "steeringBrakes",
                    "inputs": [
                        {
                            "inputType": "file-upload",
                            "dataType": "STRING",
                            "allowsMultiple": true,
                            "options": [
                                {
                                    "value": "Image",
                                    "label": "Image",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "steeringBrakes/steering/image"
                                }
                            ]
                        }
                    ],
                    "children": [
                        {
                            "type": "field",
                            "key": "issues",
                            "label": "issues",
                            "path": "steeringBrakes.steering.issues",
                            "section": "steeringBrakes",
                            "inputs": [
                                {
                                    "inputType": "multi-select",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Abnormal Noise",
                                            "label": "Abnormal Noise",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Hard",
                                            "label": "Hard",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Steering Oil Leakage",
                                            "label": "Steering Oil Leakage",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Steering Pump Noise",
                                            "label": "Steering Pump Noise",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Telescopic Adj. Not Working",
                                            "label": "Telescopic Adj. Not Working",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Wheel Adj. Not Working",
                                            "label": "Wheel Adj. Not Working",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Electrical Power Steering Not Working",
                                            "label": "Electrical Power Steering Not Working",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Hydraulic Power Steering Not Working",
                                            "label": "Hydraulic Power Steering Not Working",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                },
                {
                    "type": "group",
                    "key": "suspension",
                    "label": "suspension",
                    "path": "steeringBrakes.suspension",
                    "section": "steeringBrakes",
                    "inputs": [
                        {
                            "inputType": "file-upload",
                            "dataType": "STRING",
                            "allowsMultiple": true,
                            "options": [
                                {
                                    "value": "Image",
                                    "label": "Image",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "steeringBrakes/suspension/image"
                                }
                            ]
                        }
                    ],
                    "children": [
                        {
                            "type": "field",
                            "key": "issues",
                            "label": "issues",
                            "path": "steeringBrakes.suspension.issues",
                            "section": "steeringBrakes",
                            "inputs": [
                                {
                                    "inputType": "multi-select",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Abnormal Noise",
                                            "label": "Abnormal Noise",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Leakage from shockers",
                                            "label": "Leakage from shockers",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Damaged",
                                            "label": "Damaged",
                                            "dataType": "STRING",
                                            "inputType": "select",
                                            "subOptions1": [
                                                {
                                                    "value": "Minor",
                                                    "label": "Minor",
                                                    "dataType": "STRING",
                                                    "subOptions2": []
                                                },
                                                {
                                                    "value": "Major",
                                                    "label": "Major",
                                                    "dataType": "STRING",
                                                    "subOptions2": []
                                                },
                                                {
                                                    "value": "Severe",
                                                    "label": "Severe",
                                                    "dataType": "STRING",
                                                    "subOptions2": []
                                                }
                                            ]
                                        },
                                        {
                                            "value": "Strut mounting area damaged",
                                            "label": "Strut mounting area damaged",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                }
            ]
        },
        {
            "section": "vehicle",
            "label": "Vehicle",
            "children": [
                {
                    "type": "group",
                    "key": "appointmentDetails",
                    "label": "Appointment Details",
                    "path": "vehicle.appointmentDetails",
                    "section": "vehicle",
                    "inputs": [],
                    "children": [
                        {
                            "type": "field",
                            "key": "leadType",
                            "label": "lead Type",
                            "path": "vehicle.appointmentDetails.leadType",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "STRING",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": "C2B",
                                            "label": "C2B",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "NBFC",
                                            "label": "NBFC",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "PDI",
                                            "label": "PDI",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "NPDI",
                                            "label": "NPDI",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "WARRANTY",
                                            "label": "WARRANTY",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                },
                {
                    "type": "field",
                    "key": "carImages",
                    "label": "Car Images",
                    "path": "vehicle.carImages",
                    "section": "vehicle",
                    "inputs": [
                        {
                            "inputType": "file-upload",
                            "dataType": "STRING",
                            "allowsMultiple": true,
                            "options": [
                                {
                                    "value": "frontMain",
                                    "label": "Frontmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/frontmain"
                                },
                                {
                                    "value": "rearMain",
                                    "label": "Rearmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/rearmain"
                                },
                                {
                                    "value": "leftMain",
                                    "label": "Leftmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/leftmain"
                                },
                                {
                                    "value": "rightMain",
                                    "label": "Rightmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/rightmain"
                                },
                                {
                                    "value": "frontLhsMain",
                                    "label": "Frontlhsmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/frontlhsmain"
                                },
                                {
                                    "value": "frontRhsMain",
                                    "label": "Frontrhsmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/frontrhsmain"
                                },
                                {
                                    "value": "rearLhsMain",
                                    "label": "Rearlhsmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/rearlhsmain"
                                },
                                {
                                    "value": "rearRhsMain",
                                    "label": "Rearrhsmain",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/rearrhsmain"
                                },
                                {
                                    "value": "paintCoatingMeter",
                                    "label": "Paintcoatingmeter",
                                    "dataType": "STRING",
                                    "subOptions1": [],
                                    "uploadPath": "vehicle/carImages/paintcoatingmeter"
                                }
                            ]
                        }
                    ],
                    "children": []
                },
                {
                    "type": "group",
                    "key": "vehicleDetails",
                    "label": "Vehicle Details",
                    "path": "vehicle.vehicleDetails",
                    "section": "vehicle",
                    "inputs": [
                        {
                            "inputType": "text",
                            "dataType": "STRING",
                            "allowsMultiple": false,
                            "options": [
                                {
                                    "value": "registrationNumber",
                                    "label": "Registration Number",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                },
                                {
                                    "value": "make",
                                    "label": "Make",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                },
                                {
                                    "value": "model",
                                    "label": "Model",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                },
                                {
                                    "value": "variant",
                                    "label": "Variant",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                },
                                {
                                    "value": "vinPlate",
                                    "label": "Vin Plate",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                },
                                {
                                    "value": "chassisNumber",
                                    "label": "Chassis Number",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                }
                            ]
                        },
                        {
                            "inputType": "number",
                            "dataType": "NUMBER",
                            "allowsMultiple": false,
                            "options": [
                                {
                                    "value": "mfgYear",
                                    "label": "Mfg Year",
                                    "dataType": "NUMBER",
                                    "subOptions1": []
                                },
                                {
                                    "value": "mfgMonth",
                                    "label": "Mfg Month",
                                    "dataType": "STRING",
                                    "subOptions1": []
                                }
                            ]
                        }
                    ],
                    "children": [
                        {
                            "type": "group",
                            "key": "chassisEmbossing",
                            "label": "chassis Embossing",
                            "path": "vehicle.vehicleDetails.chassisEmbossing",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "Image",
                                            "label": "Image",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/chassisEmbossing/image"
                                        }
                                    ]
                                }
                            ],
                            "children": [
                                {
                                    "type": "field",
                                    "key": "issues",
                                    "label": "issues",
                                    "path": "vehicle.vehicleDetails.chassisEmbossing.issues",
                                    "section": "vehicle",
                                    "inputs": [
                                        {
                                            "inputType": "multi-select",
                                            "dataType": "STRING",
                                            "allowsMultiple": true,
                                            "options": [
                                                {
                                                    "value": "Rusted",
                                                    "label": "Rusted",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Repunched",
                                                    "label": "Repunched",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Not traceable",
                                                    "label": "Not traceable",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Incomplete",
                                                    "label": "Incomplete",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                },
                                                {
                                                    "value": "Mis-Match",
                                                    "label": "Mis-Match",
                                                    "dataType": "STRING",
                                                    "subOptions1": []
                                                }
                                            ]
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "type": "field",
                            "key": "duplicateKeyPresent",
                            "label": "duplicate Key Present",
                            "path": "vehicle.vehicleDetails.duplicateKeyPresent",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "fuelType",
                            "label": "fuel Type",
                            "path": "vehicle.vehicleDetails.fuelType",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "STRING",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": "Diesel",
                                            "label": "Diesel",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Petrol",
                                            "label": "Petrol",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "CNG",
                                            "label": "CNG",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "LPG",
                                            "label": "LPG",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "isCarWrappingOrPPFDone",
                            "label": "is Car Wrapping Or Ppfdone",
                            "path": "vehicle.vehicleDetails.isCarWrappingOrPPFDone",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "isCngAvailable",
                            "label": "is Cng Available",
                            "path": "vehicle.vehicleDetails.isCngAvailable",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "isRegistrationTransferredFromAnotherState",
                            "label": "is Registration Transferred From Another State",
                            "path": "vehicle.vehicleDetails.isRegistrationTransferredFromAnotherState",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "isScrapCar",
                            "label": "is Scrap Car",
                            "path": "vehicle.vehicleDetails.isScrapCar",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "BOOLEAN",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": true,
                                            "label": "true",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": false,
                                            "label": "false",
                                            "dataType": "BOOLEAN",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "photos",
                            "label": "photos",
                            "path": "vehicle.vehicleDetails.photos",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "file-upload",
                                    "dataType": "STRING",
                                    "allowsMultiple": true,
                                    "options": [
                                        {
                                            "value": "rcFront",
                                            "label": "Rcfront",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/rcfront"
                                        },
                                        {
                                            "value": "rcBack",
                                            "label": "Rcback",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/rcback"
                                        },
                                        {
                                            "value": "ownerManual",
                                            "label": "Ownermanual",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/ownermanual"
                                        },
                                        {
                                            "value": "hypothecationProof",
                                            "label": "Hypothecationproof",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/hypothecationproof"
                                        },
                                        {
                                            "value": "addressProof",
                                            "label": "Addressproof",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/addressproof"
                                        },
                                        {
                                            "value": "cngPlate",
                                            "label": "Cngplate",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/cngplate"
                                        },
                                        {
                                            "value": "cngTestCertificate",
                                            "label": "Cngtestcertificate",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/cngtestcertificate"
                                        },
                                        {
                                            "value": "roadTaxDocument",
                                            "label": "Roadtaxdocument",
                                            "dataType": "STRING",
                                            "subOptions1": [],
                                            "uploadPath": "vehicle/vehicleDetails/photos/roadtaxdocument"
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "rcAvailability",
                            "label": "rc Availability",
                            "path": "vehicle.vehicleDetails.rcAvailability",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "STRING",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": "Yes",
                                            "label": "Yes",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Lost",
                                            "label": "Lost",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Submit Later",
                                            "label": "Submit Later",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        },
                        {
                            "type": "field",
                            "key": "rcCondition",
                            "label": "rc Condition",
                            "path": "vehicle.vehicleDetails.rcCondition",
                            "section": "vehicle",
                            "inputs": [
                                {
                                    "inputType": "select",
                                    "dataType": "STRING",
                                    "allowsMultiple": false,
                                    "options": [
                                        {
                                            "value": "Original",
                                            "label": "Original",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Duplicate",
                                            "label": "Duplicate",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        },
                                        {
                                            "value": "Lost with photocopy",
                                            "label": "Lost with photocopy",
                                            "dataType": "STRING",
                                            "subOptions1": []
                                        }
                                    ]
                                }
                            ],
                            "children": []
                        }
                    ]
                }
            ]
        }
    ],
    "metadata": {
        "uploadPathsBySection": {
            "electricalsInteriors": [
                "electricalsInteriors/Doors/frontLeftWindow/image",
                "electricalsInteriors/Doors/frontRightWindow/image",
                "electricalsInteriors/Accessories/musicSystem/isPresent/video",
                "electricalsInteriors/Accessories/sunroof/isAvailable/image"
            ],
            "engineTransmission": [
                "engineTransmission/engineImage/batteryAlternator/image",
                "engineTransmission/engineImage/coolant/image",
                "engineTransmission/engineImage/engineOil/image",
                "engineTransmission/engineImage/sump/image",
                "engineTransmission/engineSoundTest/obdConnection/image",
                "engineTransmission/engineSoundTest/blowBy2000rpm/image",
                "engineTransmission/engineSoundTest/blowByIdle/image",
                "engineTransmission/engineSoundTest/exhaustSmoke/image",
                "engineTransmission/engineSoundTest/fuelInjector/image",
                "engineTransmission/engineSoundTest/radiator/image",
                "engineTransmission/engineSoundTest/turbocharger/image",
                "engineTransmission/engine/clutch/image",
                "engineTransmission/engine/engineCondition/image",
                "engineTransmission/engine/engineMounting/image",
                "engineTransmission/engine/transmissionGearShifting/image",
                "engineTransmission/roadTest/image"
            ],
            "exterior": [
                "exterior/bodyPanels/bootFloor/image",
                "exterior/bodyPanels/frontBumper/image",
                "exterior/bodyPanels/lhsA_Pillar/image",
                "exterior/bodyPanels/lhsB_Pillar/image",
                "exterior/bodyPanels/lhsC_Pillar/image",
                "exterior/bodyPanels/lhsFender/image",
                "exterior/bodyPanels/lhsFrontDoor/image",
                "exterior/bodyPanels/lhsQuarterPanel/image",
                "exterior/bodyPanels/lhsRearDoor/image",
                "exterior/bodyPanels/lhsRunningBorder/image",
                "exterior/bodyPanels/rearBumper/image",
                "exterior/bodyPanels/rhsA_Pillar/image",
                "exterior/bodyPanels/rhsB_Pillar/image",
                "exterior/bodyPanels/rhsC_Pillar/image",
                "exterior/bodyPanels/rhsFender/image",
                "exterior/bodyPanels/rhsFrontDoor/image",
                "exterior/bodyPanels/rhsQuarterPanel/image",
                "exterior/bodyPanels/rhsRearDoor/image",
                "exterior/bodyPanels/rhsRunningBorder/image",
                "exterior/bodyPanels/roof/image",
                "exterior/lightsGlass/frontWindshield/image",
                "exterior/lightsGlass/lhsFogLight/image",
                "exterior/lightsGlass/lhsHeadlight/image",
                "exterior/lightsGlass/lhsTailLight/image",
                "exterior/lightsGlass/rearWindshield/image",
                "exterior/lightsGlass/rhsFogLight/image",
                "exterior/lightsGlass/rhsHeadlight/image",
                "exterior/lightsGlass/rhsTailLight/image",
                "exterior/orvm/lhs/image",
                "exterior/orvm/rhs/image",
                "exterior/structure/firewall/image",
                "exterior/structure/headlightSupport/image",
                "exterior/structure/lhsApron/image",
                "exterior/structure/lowerCrossMember/image",
                "exterior/structure/radiatorSupport/image",
                "exterior/structure/rhsApron/image",
                "exterior/structure/rhsApronLeg/image",
                "exterior/structure/upperCrossMember/image",
                "exterior/wheelsTyres/lhsFrontWheel/image",
                "exterior/wheelsTyres/lhsRearWheel/image",
                "exterior/wheelsTyres/rhsFrontWheel/image",
                "exterior/wheelsTyres/rhsRearWheel/image"
            ],
            "steeringBrakes": [
                "steeringBrakes/brakes/image",
                "steeringBrakes/steering/image",
                "steeringBrakes/suspension/image"
            ],
            "vehicle": [
                "vehicle/carImages/frontmain",
                "vehicle/carImages/rearmain",
                "vehicle/carImages/leftmain",
                "vehicle/carImages/rightmain",
                "vehicle/carImages/frontlhsmain",
                "vehicle/carImages/frontrhsmain",
                "vehicle/carImages/rearlhsmain",
                "vehicle/carImages/rearrhsmain",
                "vehicle/carImages/paintcoatingmeter",
                "vehicle/vehicleDetails/chassisEmbossing/image",
                "vehicle/vehicleDetails/photos/rcfront",
                "vehicle/vehicleDetails/photos/rcback",
                "vehicle/vehicleDetails/photos/ownermanual",
                "vehicle/vehicleDetails/photos/hypothecationproof",
                "vehicle/vehicleDetails/photos/addressproof",
                "vehicle/vehicleDetails/photos/cngplate",
                "vehicle/vehicleDetails/photos/cngtestcertificate",
                "vehicle/vehicleDetails/photos/roadtaxdocument"
            ]
        }
    }
}