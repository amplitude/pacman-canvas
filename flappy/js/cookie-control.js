const apiKey = '106b5e962520ab454786a0d1ba709e47372ef512';
const product = 'PRO_MULTISITE';
const acceptedCountryList = ['US', 'CA', 'AR', 'BO', 'BR', 'CL', 'CO', 'EC',
	'FK', 'GF', 'GY', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'];

const COOKIE_CATEGORIES = {
	PERFORMANCE: 'performance',
}

const EVENT_TYPES = {
	APPLY_COOKIE_PREFERENCES: '[Cookie-Control] apply cookie preferences',
	OPENED_WIDGET: '[Cookie-Control] opened widget',
	VIEWED_WIDGET: '[Cookie-Control] viewed widget',
	BUTTON_CLICK: '[Cookie-Control] button click'
};

const config = {
	apiKey,
	product,

	// When the user is in EU, this will automatically chnage to GDPR (opt-in)
	mode: 'ccpa',

	initialState: "NOTIFY",
  layout: "POPUP",
  position: "RIGHT",
  theme: "LIGHT",
  text : {
    title: 'This site uses cookies.',
    intro:  'Some of these cookies are essential, while others help us to improve your experience by providing insights into how the site is being used.',
    necessaryTitle : 'Necessary Cookies',
    necessaryDescription : 'Necessary cookies enable core functionality. The website cannot function properly without these cookies, and can only be disabled by changing your browser preferences.',
		accept: 'Accept',
		reject: 'Reject',
	},

  statement: {
    description: 'See our',
    name : 'Privacy Policy',
    url: 'https://amplitude.com/privacy#cookies',
    updated : '25/04/2018'
	},

	ccpaConfig : {
    description: 'See our',
    name : 'Personal Information Policy',
    url: 'https://amplitude.com/privacy',
    updated : '25/04/2018'
  },

  branding : {
    fontColor: "#003b61",
    backgroundColor: '#e4f1fa',
    removeIcon: true,
    removeAbout: true
  },

	necessaryCookies: [
		'__d_mkto',  // Marketo
		'_mkto_trk',  // Marketo
		'BIGipServerab13web-app_https',  // Marketo
		'__utmzz', // utmz cookie replicator necessary to track utm google values
	],

	optionalCookies: [
		{
			name: 'performance',
			label: 'Performance',
			description: 'We use these cookies to monitor and improve website performance.',
			recommendedState: true,
			cookies: [
				'amplitude_id*',  // Amplitude SDK
				'amp_*', // Newer Amplitude SDK
				'1P_JAR',  // Google Analytics
				'DV',  // Google Analytics
				'NID',  // Google Analytics
				'OGPC',  // Google Analytics
				'_ga',  // Google Analytics
				'_gid',  // Google Analytics
				'_gat*',  // Google Analytics
			],
			onAccept,
			onRevoke,
		}
	],
}

// Handle accept clicks
function onAccept() {

	// Add GTM
	(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','GTM-P2758JK');

	// Log Event
	amplitude.getInstance().logEvent(EVENT_TYPES.APPLY_COOKIE_PREFERENCES, {
		"type": COOKIE_CATEGORIES.PERFORMANCE,
		"action": "accept"
	});
}

// Handle revoke clicks
function onRevoke() {
	amplitude.getInstance().logEvent(EVENT_TYPES.APPLY_COOKIE_PREFERENCES, {
		"type": COOKIE_CATEGORIES.PERFORMANCE,
		"action": "revoke"
	});
}

CookieControl.load( config )
