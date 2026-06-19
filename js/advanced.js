// Advanced dashboard data generated 2026-06-19
// Domain trends, conference comparison, Korea participation, emerging vs mature

const DOMAIN_TIMELINE = {
  "2023": {
    "Circuits & Systems": 115,
    "Devices & Process Technology": 293,
    "Special / Non-technical": 13,
    "Cross-cutting / Emerging Computing": 47
  },
  "2024": {
    "Special / Non-technical": 25,
    "Devices & Process Technology": 736,
    "Circuits & Systems": 422,
    "Cross-cutting / Emerging Computing": 94
  },
  "2025": {
    "Devices & Process Technology": 786,
    "Cross-cutting / Emerging Computing": 123,
    "Circuits & Systems": 387,
    "Special / Non-technical": 22
  },
  "2026": {
    "Devices & Process Technology": 492,
    "Circuits & Systems": 295,
    "Special / Non-technical": 9,
    "Cross-cutting / Emerging Computing": 19
  }
};

const CONF_DOMAIN = {
  "IEDM": {
    "Circuits & Systems": 62,
    "Devices & Process Technology": 671,
    "Special / Non-technical": 11,
    "Cross-cutting / Emerging Computing": 103
  },
  "ISSCC": {
    "Circuits & Systems": 681,
    "Devices & Process Technology": 164,
    "Special / Non-technical": 32,
    "Cross-cutting / Emerging Computing": 54
  },
  "KCS": {
    "Circuits & Systems": 135,
    "Devices & Process Technology": 1142,
    "Cross-cutting / Emerging Computing": 89
  },
  "VLSI": {
    "Devices & Process Technology": 330,
    "Circuits & Systems": 341,
    "Special / Non-technical": 26,
    "Cross-cutting / Emerging Computing": 37
  }
};

const KOREA_PARTICIPATION = {
  "IEDM": {
    "Circuits & Systems": {
      "korean": 0,
      "total": 62,
      "percentage": 0.0
    },
    "Devices & Process Technology": {
      "korean": 0,
      "total": 671,
      "percentage": 0.0
    },
    "Special / Non-technical": {
      "korean": 0,
      "total": 11,
      "percentage": 0.0
    },
    "Cross-cutting / Emerging Computing": {
      "korean": 0,
      "total": 103,
      "percentage": 0.0
    }
  },
  "ISSCC": {
    "Circuits & Systems": {
      "korean": 0,
      "total": 681,
      "percentage": 0.0
    },
    "Devices & Process Technology": {
      "korean": 0,
      "total": 164,
      "percentage": 0.0
    },
    "Special / Non-technical": {
      "korean": 0,
      "total": 32,
      "percentage": 0.0
    },
    "Cross-cutting / Emerging Computing": {
      "korean": 0,
      "total": 54,
      "percentage": 0.0
    }
  },
  "KCS": {
    "Circuits & Systems": {
      "korean": 0,
      "total": 135,
      "percentage": 0.0
    },
    "Devices & Process Technology": {
      "korean": 0,
      "total": 1142,
      "percentage": 0.0
    },
    "Cross-cutting / Emerging Computing": {
      "korean": 0,
      "total": 89,
      "percentage": 0.0
    }
  },
  "VLSI": {
    "Devices & Process Technology": {
      "korean": 0,
      "total": 330,
      "percentage": 0.0
    },
    "Circuits & Systems": {
      "korean": 0,
      "total": 341,
      "percentage": 0.0
    },
    "Special / Non-technical": {
      "korean": 0,
      "total": 26,
      "percentage": 0.0
    },
    "Cross-cutting / Emerging Computing": {
      "korean": 0,
      "total": 37,
      "percentage": 0.0
    }
  }
};

const EMERGING_VS_MATURE = {
  "emerging": {
    "count": 846,
    "percentage": 21.7
  },
  "mature": {
    "count": 3057,
    "percentage": 78.3
  },
  "total": 3903
};

// Export for use in charts
if (typeof window !== 'undefined') {
  window.DOMAIN_TIMELINE = DOMAIN_TIMELINE;
  window.CONF_DOMAIN = CONF_DOMAIN;
  window.KOREA_PARTICIPATION = KOREA_PARTICIPATION;
  window.EMERGING_VS_MATURE = EMERGING_VS_MATURE;
}
