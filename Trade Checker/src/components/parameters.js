// Trading parameters configuration with groupings as specified
export const PARAMETER_GROUPS = [
  {
    title: "SROOT Analysis (P1-P3)",
    parameters: [
      {
        key: 'p1',
        label: 'P1: .50 touch after SROOT?',
        description: 'Did price touch .50 level after SROOT was established?'
      },
      {
        key: 'p2', 
        label: 'P2: Venus Touch before SROOT(+.50)',
        description: 'Did Venus indicator touch before SROOT plus .50?'
      },
      {
        key: 'p3',
        label: 'P3: Mercury Touch before SROOT(+.50)', 
        description: 'Did Mercury indicator touch before SROOT plus .50?'
      }
    ]
  },
  {
    title: "Post-SROOT Touches (P4-P6)",
    parameters: [
      {
        key: 'p4',
        label: 'P4: Venus touch AFTER SROOT?',
        description: 'Did Venus indicator touch after SROOT was established?'
      },
      {
        key: 'p5',
        label: 'P5: Mercury touch AFTER SROOT?',
        description: 'Did Mercury indicator touch after SROOT was established?'
      },
      {
        key: 'p6',
        label: 'P6: R Venus touch right after -1.0?',
        description: 'Did reverse Venus touch right after -1.0 level?'
      }
    ]
  },
  {
    title: "Reverse Analysis (P7-P9)", 
    parameters: [
      {
        key: 'p7',
        label: 'P7: R Mercury touch right after -1.0?',
        description: 'Did reverse Mercury touch right after -1.0 level?'
      },
      {
        key: 'p8',
        label: 'P8: R Venus Touch after -.50',
        description: 'Did reverse Venus touch after -.50 level?'
      },
      {
        key: 'p9',
        label: 'P9: R Mercury touch after -.50',
        description: 'Did reverse Mercury touch after -.50 level?'
      }
    ]
  },
  {
    title: "Salt & Trigger Analysis (P10-P12)",
    parameters: [
      {
        key: 'p10',
        label: 'P10: -.50 touch after Salt Achieved &(before Trigger)?',
        description: 'Did price touch -.50 after Salt was achieved but before Trigger?'
      },
      {
        key: 'p11',
        label: 'P11: -1.0 Reswept?',
        description: 'Was the -1.0 level reswept during the trade?'
      },
      {
        key: 'p12',
        label: 'P12: Reverse Highest C Candle redefined?',
        description: 'Was the reverse highest close candle redefined?'
      }
    ]
  },
  {
    title: "VL & EB Levels (P13-P15)",
    parameters: [
      {
        key: 'p13',
        label: 'P13: VL under .114?',
        description: 'Was the VL (Volume Level) under .114?'
      },
      {
        key: 'p14',
        label: 'P14: VL above .836?',
        description: 'Was the VL (Volume Level) above .836?'
      },
      {
        key: 'p15',
        label: 'P15: EB above .836',
        description: 'Was the EB (Entry Block) above .836?'
      }
    ]
  }
];

// Initialize empty parameters object
export const initializeParameters = () => {
  const params = {};
  PARAMETER_GROUPS.forEach(group => {
    group.parameters.forEach(param => {
      params[param.key] = null; // null = not selected, true = yes, false = no
    });
  });
  return params;
};

// Validate that all parameters are filled
export const validateParameters = (parameters) => {
  const allKeys = [];
  PARAMETER_GROUPS.forEach(group => {
    group.parameters.forEach(param => {
      allKeys.push(param.key);
    });
  });
  
  return allKeys.every(key => parameters[key] !== null && parameters[key] !== undefined);
};

// Get parameter display value
export const getParameterDisplayValue = (value) => {
  if (value === null || value === undefined) return 'Not Set';
  return value ? 'Yes' : 'No';
};

export default PARAMETER_GROUPS;