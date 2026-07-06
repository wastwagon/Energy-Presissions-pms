"""Default CMS page sections — merged with DB overrides on read."""
from __future__ import annotations

import copy
from typing import Any, Dict

CMS_PAGES = (
    "home",
    "about",
    "services",
    "shop",
    "contact",
    "global",
    "packages",
    "financing",
    "portfolio",
    "blog",
    "reviews",
    "referral",
    "privacy",
    "terms",
    "warranty",
    "locations",
    "faqs",
    "solar_estimate",
    "load_calculator",
)

_DEFAULTS: Dict[str, Dict[str, Any]] = {
    "home": {
        "seo": {
            "title": "Energy Precisions | Ghana Energy Transition · Solar & Hybrid Power",
            "description": (
                "Partner in Ghana's energy transition: hybrid solar, lithium storage, turnkey "
                "installation and lifecycle support for homes, business and industry. "
                "Accra-based, nationwide."
            ),
        },
        "hero": {
            "badge": "Ghana's Premier Solar Energy Brand",
            "headline": "Powering Ghana's Future with",
            "headline_highlight": "Clean Energy",
            "description": (
                "Turnkey solar for homes and businesses across Ghana — engineering, equipment, "
                "installation and maintenance."
            ),
            "hero_image": "/portfolio/ep-install-01.jpg",
            "image_overlay": "Turnkey · Grid & generator ready",
            "pillars": [
                "Solar generation",
                "Lithium storage",
                "Hybrid backup",
                "Monitoring",
            ],
            "stats": [],
            "primary_cta_text": "Get free consultation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "Browse products",
            "secondary_cta_link": "/shop",
            "link1_text": "Solar size estimator",
            "link1_url": "/solar-estimate",
            "link2_text": "Appliance load calculator",
            "link2_url": "/load-calculator",
            "slider": {"autoplay_seconds": 7},
            "slides": [
                {
                    "badge": "Ghana's Premier Solar Energy Brand",
                    "headline": "Powering Ghana's Future with",
                    "headline_highlight": "Clean Energy",
                    "description": (
                        "Turnkey solar for homes and businesses across Ghana — engineering, equipment, "
                        "installation and maintenance."
                    ),
                    "hero_image": "/portfolio/ep-install-01.jpg",
                    "image_overlay": "Turnkey · Grid & generator ready",
                    "primary_cta_text": "Get free consultation",
                    "primary_cta_link": "/contact?action=quote",
                    "secondary_cta_text": "Browse products",
                    "secondary_cta_link": "/shop",
                },
                {
                    "badge": "LiFePO₄ HYBRID BACKUP",
                    "headline": "Backup that works when the grid",
                    "headline_highlight": "doesn't",
                    "description": (
                        "Hybrid solar with lithium backup. Turnkey package tiers engineered and "
                        "installed from our Accra office."
                    ),
                    "hero_image": "/portfolio/ep-install-02.jpg",
                    "image_overlay": "Hybrid · Lithium · Monitoring",
                    "primary_cta_text": "View hybrid packages",
                    "primary_cta_link": "/solar-packages",
                    "secondary_cta_text": "Book site assessment",
                    "secondary_cta_link": "/contact?action=quote&topic=package",
                },
                {
                    "badge": "COMMERCIAL & INDUSTRIAL",
                    "headline": "Solar engineered for",
                    "headline_highlight": "Ghanaian business",
                    "description": (
                        "Load-led sizing and premium equipment for offices, factories, and farms — "
                        "with maintenance that keeps you generating."
                    ),
                    "hero_image": "/portfolio/ep-install-05.jpg",
                    "image_overlay": "Engineering-led · Nationwide",
                    "primary_cta_text": "Get free consultation",
                    "primary_cta_link": "/contact?action=quote",
                    "secondary_cta_text": "See our services",
                    "secondary_cta_link": "/services",
                },
            ],
        },
        "credibility": {
            "eyebrow": "Why Energy Precisions",
            "headline": "Engineered solar for Ghana — one partner from survey to support",
            "proofs": [
                {
                    "title": "Engineering-first sizing",
                    "description": (
                        "Load profiles and bill-of-materials before we quote — capacity matched "
                        "to how you use power."
                    ),
                },
                {
                    "title": "Tier-one equipment",
                    "description": (
                        "Panels, inverters and lithium storage specified for Ghana's climate — "
                        "not generic kit lists."
                    ),
                },
                {
                    "title": "Full lifecycle support",
                    "description": (
                        "Commissioning, registration guidance, monitoring and maintenance from "
                        "the same Accra-based team."
                    ),
                },
            ],
        },
        "why_choose": {
            "badge": "WHY ENERGY PRECISIONS",
            "title": "One accountable partner",
            "subtitle": (
                "Accra-based, Ghana-wide — turnkey delivery from design through maintenance, "
                "not a one-off install."
            ),
            "features": [
                {
                    "title": "Premium Quality Equipment",
                    "description": (
                        "We source only the finest solar panels, inverters, and batteries from "
                        "leading global manufacturers. Every product is tested and certified for "
                        "Ghana's climate."
                    ),
                },
                {
                    "title": "Expert Installation Team",
                    "description": (
                        "Certified technicians commission hybrid and grid-tied systems from our Accra "
                        "team — with labelled handover and documented as-built records."
                    ),
                },
                {
                    "title": "Documented Warranty",
                    "description": (
                        "Manufacturer coverage on equipment plus workmanship terms confirmed in your "
                        "quotation (typically 2 years on hybrid installs). See our warranty page for details."
                    ),
                },
                {
                    "title": "Local Partner, Full Lifecycle",
                    "description": (
                        "Accra-based team with national reach: responsive support, maintenance, "
                        "and after-sales service — closing the gap many installers leave open "
                        "after commissioning."
                    ),
                },
                {
                    "title": "Proven Track Record",
                    "description": (
                        "Trusted by residential, commercial, and industrial clients across Ghana. "
                        "See our case studies and customer testimonials."
                    ),
                },
                {
                    "title": "Sustainable Future",
                    "description": (
                        "Reduce grid dependence and diesel spend with solar sized to your real load — "
                        "a practical step toward lower bills and cleaner power."
                    ),
                },
            ],
        },
        "services_section": {
            "badge": "OUR SERVICES",
            "title": "Complete Solar Solutions for Ghana",
            "subtitle": (
                "Residential, commercial, industrial — plus agricultural and productive-use solar. "
                "One partner for equipment, engineering, installation, and long-term performance."
            ),
        },
        "service_cards": {
            "view_all_text": "View All Services",
            "view_all_link": "/services",
            "items": [
                {
                    "title": "Residential Solar",
                    "description": (
                        "Complete home solar systems with battery backup. Reduce your electricity bills "
                        "by up to 90% with our premium residential solutions."
                    ),
                    "features": [
                        "Grid-tied & Off-grid Systems",
                        "Battery Storage Options",
                        "Smart Monitoring",
                        "Maintenance Support",
                    ],
                    "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
                    "link": "/services#residential",
                    "button_text": "Learn More",
                },
                {
                    "title": "Commercial Solar",
                    "description": (
                        "Large-scale solar installations for businesses, offices, and commercial buildings. "
                        "Maximize ROI with our commercial solar solutions."
                    ),
                    "features": [
                        "Custom System Design",
                        "ROI Analysis",
                        "Minimal Business Disruption",
                        "Long-term Savings",
                    ],
                    "image": "/website_images/services-commercial-solar.png",
                    "link": "/services#commercial",
                    "button_text": "Learn More",
                },
                {
                    "title": "Industrial Solar",
                    "description": (
                        "Heavy-duty solar systems for factories and industrial facilities. "
                        "Power your operations with reliable, cost-effective solar energy."
                    ),
                    "features": [
                        "High-Capacity Systems",
                        "Industrial-Grade Equipment",
                        "Custom Engineering",
                        "24/7 Monitoring",
                    ],
                    "image": "/website_images/services-industrial-solar.png",
                    "link": "/services#industrial",
                    "button_text": "Learn More",
                },
                {
                    "title": "Agricultural & Productive Use",
                    "description": (
                        "Solar for irrigation, cold chain, and processing — cutting diesel costs and "
                        "unlocking reliable power where the grid is weak or absent."
                    ),
                    "features": [
                        "Irrigation & Pumping",
                        "Processing & Storage",
                        "Off-grid & Hybrid Designs",
                        "Scalable for Cooperatives",
                    ],
                    "image": "/website_images/services-agricultural-productive-use.png",
                    "link": "/services#agricultural",
                    "button_text": "Learn More",
                },
                {
                    "title": "Battery Storage",
                    "description": (
                        "LiFePO₄ battery systems for backup and independence — store solar for outages "
                        "and peak hours."
                    ),
                    "features": [
                        "Hybrid Backup",
                        "LiFePO₄ Modules",
                        "Smart BMS",
                        "Scalable Capacity",
                    ],
                    "image": "/website_images/services-battery-storage-solutions.png",
                    "link": "/services#battery",
                    "button_text": "Learn More",
                },
                {
                    "title": "Maintenance & Monitoring",
                    "description": (
                        "Ongoing checks and remote monitoring so your system stays at peak performance "
                        "year after year."
                    ),
                    "features": [
                        "Performance Monitoring",
                        "Preventive Maintenance",
                        "Fast Response",
                        "Annual Inspections",
                    ],
                    "image": "/website_images/services-maintenance-monitoring.png",
                    "link": "/services",
                    "button_text": "Learn More",
                },
            ],
        },
        "portfolio": {
            "badge": "OUR PORTFOLIO",
            "title": "Projects That Power Ghana",
            "subtitle": (
                "Explore our completed installations across residential, commercial, and industrial sectors."
            ),
            "cta_text": "View Portfolio",
            "cta_link": "/portfolio",
            "items": [
                {
                    "title": "Residential rooftop — Greater Accra",
                    "image": "/portfolio/ep-install-01.jpg",
                    "alt": "Solar panels installed on a residential roof",
                    "link": "/portfolio",
                },
                {
                    "title": "Commercial office array",
                    "image": "/portfolio/ep-install-02.jpg",
                    "alt": "Solar installation on a commercial building",
                    "link": "/portfolio",
                },
                {
                    "title": "Industrial canopy project",
                    "image": "/website_images/services-industrial-solar.png",
                    "alt": "Large-scale solar array at an industrial site",
                    "link": "/portfolio",
                },
            ],
        },
        "process": {
            "badge": "OUR PROCESS",
            "title": "Simple 5-Step Installation Process",
            "subtitle": "From first conversation to commissioning — a clear path with no surprises.",
            "steps": [
                {"step": "01", "title": "Consultation", "desc": "Site assessment and energy needs analysis"},
                {"step": "02", "title": "Design", "desc": "Tailored system design for your property"},
                {"step": "03", "title": "Equipment", "desc": "Choose from premium solar equipment"},
                {"step": "04", "title": "Installation", "desc": "Expert installation by certified technicians"},
                {"step": "05", "title": "Support", "desc": "System activation and ongoing maintenance"},
            ],
        },
        "testimonials": {
            "badge": "CLIENT TESTIMONIALS",
            "title": "Trusted by Ghanaians Across the Country",
            "subtitle": "Real feedback from residential, commercial and industrial clients across Ghana.",
            "items": [
                {
                    "name": "Kwame Asante",
                    "location": "Accra, Ghana",
                    "role": "Homeowner",
                    "text": (
                        "Energy Precisions transformed our home with a complete solar system. "
                        "Our electricity bills dropped by 85% and we have reliable power 24/7. "
                        "The installation was professional and the team was excellent."
                    ),
                    "rating": 5,
                },
                {
                    "name": "Ama Osei",
                    "location": "Kumasi, Ghana",
                    "role": "Business Owner",
                    "text": (
                        "As a business owner, switching to solar was the best decision. "
                        "Energy Precisions provided a custom commercial system that pays for itself. "
                        "Their after-sales support is outstanding."
                    ),
                    "rating": 5,
                },
                {
                    "name": "David Mensah",
                    "location": "Tamale, Ghana",
                    "role": "Factory Manager",
                    "text": (
                        "The quality of equipment and installation exceeded our expectations. "
                        "We've had zero issues in 2 years. Highly recommend Energy Precisions "
                        "for anyone considering solar in Ghana."
                    ),
                    "rating": 5,
                },
            ],
        },
        "closing_cta": {
            "title": "Ready to Go Solar in Ghana?",
            "subtitle": (
                "Join thousands of satisfied customers across Ghana who have made the switch "
                "to clean, affordable solar energy. Get your free quote today."
            ),
            "primary_cta_text": "Get free consultation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "Browse Products",
            "secondary_cta_link": "/shop",
        },
    },
    "about": {
        "seo": {
            "title": "About Energy Precisions | Ghana Solar Company",
            "description": (
                "Ghana's premier solar energy company — turnkey solutions from design and "
                "installation to equipment and maintenance. Learn our story and values."
            ),
        },
        "hero": {
            "badge": "ABOUT ENERGY PRECISIONS",
            "headline": "Ghana's Premier Solar Energy Company",
            "headline_highlight": "",
            "description": (
                "Energy Precisions is Ghana's leading solar energy solutions provider, "
                "delivering turnkey systems from premium equipment and expert engineering to "
                "professional installation and long-term maintenance. We serve homes, businesses, "
                "and industry nationwide — with the depth of service local installers rarely match."
            ),
            "hero_image": "/portfolio/ep-install-01.jpg",
            "image_overlay": "",
            "stats": [],
            "primary_cta_text": "Get free consultation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "Our Services",
            "secondary_cta_link": "/services",
            "link1_text": "",
            "link1_url": "",
            "link2_text": "",
            "link2_url": "",
            "pillars": [],
        },
        "mission_vision": {
            "mission_title": "Our Mission",
            "mission_text": (
                "To empower every Ghanaian home and business with reliable, affordable solar energy "
                "solutions. We believe in sustainable energy practices that preserve our planet while "
                "reducing energy costs and increasing energy independence across Ghana."
            ),
            "vision_title": "Our Vision",
            "vision_text": (
                "To become Ghana's most trusted and recognized solar energy company, leading the transition "
                "to clean energy. We envision a future where every Ghanaian has access to reliable, "
                "sustainable solar power that powers their dreams and ambitions."
            ),
        },
        "why_choose": {
            "badge": "",
            "title": "What Makes Us Ghana's Best",
            "subtitle": "",
            "features": [
                {
                    "title": "Based in Ghana, For Ghana",
                    "description": (
                        "We understand Ghana's unique energy challenges and climate. Our solutions are "
                        "specifically designed for Ghanaian homes and businesses."
                    ),
                },
                {
                    "title": "Complete Solutions Provider",
                    "description": (
                        "From equipment sales to installation, maintenance, and support — we provide "
                        "end-to-end solar solutions under one roof."
                    ),
                },
                {
                    "title": "Expert Team",
                    "description": (
                        "Our certified technicians have years of experience installing solar systems "
                        "across Ghana. Continuous training ensures we stay ahead."
                    ),
                },
                {
                    "title": "Trusted & Reliable",
                    "description": (
                        "Accra-based engineering and install coordination with documented handover, "
                        "clear warranty terms, and responsive after-sales support."
                    ),
                },
                {
                    "title": "Proven Track Record",
                    "description": (
                        "Residential, commercial, and light industrial projects across Greater Accra "
                        "and other regions — see our portfolio for recent installs."
                    ),
                },
                {
                    "title": "Sustainable Future",
                    "description": (
                        "Practical solar and hybrid backup sized to your load — lower bills and less "
                        "diesel dependence where the grid is unreliable."
                    ),
                },
            ],
        },
        "specialties": {
            "badge": "OUR VALUES",
            "title": "What We Stand For",
            "subtitle": (
                "Our values define how we design systems, serve clients, and deliver long-term solar "
                "performance across Ghana."
            ),
            "items": [
                "Lower Energy Costs",
                "Environmentally Friendly",
                "Solar Scalability",
                "Energy Independence",
            ],
        },
        "impact_stats": {
            "title": "",
            "items": [],
        },
        "visit_us": {
            "badge": "VISIT US",
            "title": "Located in the Heart of Accra",
            "subtitle": "Serving all of Ghana with expert solar solutions",
            "location_title": "Our Location",
            "location_address": "Haatso, Ecomog, Accra, Ghana",
            "location_body": (
                "Visit our showroom to see our products in person, meet our team, and get expert "
                "advice on the best solar solution for your needs. We're open Monday to Saturday, "
                "8:00 AM to 6:00 PM."
            ),
            "cta_title": "Ready to Go Solar?",
            "cta_body": (
                "Contact us today for a free consultation. Our team will assess your energy needs "
                "and provide a customized solar solution for your home or business."
            ),
            "phone": "(+233) 533 611 611",
            "email": "info@energyprecisions.com",
        },
    },
    "services": {
        "seo": {
            "title": "Solar Services Ghana | Residential, Commercial & Industrial",
            "description": (
                "Residential, commercial, industrial and agricultural solar in Ghana — design, "
                "installation, battery storage, monitoring and maintenance from Energy Precisions."
            ),
        },
        "hero": {
            "badge": "OUR SERVICES",
            "headline": "Complete Solar Solutions for Ghana",
            "headline_highlight": "",
            "description": (
                "From premium equipment sales to expert installation and ongoing maintenance, "
                "we provide end-to-end solar energy solutions tailored for Ghana's unique "
                "energy needs."
            ),
            "hero_image": "",
            "image_overlay": "",
            "stats": [],
            "primary_cta_text": "Get Free Quote",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "Browse Packages",
            "secondary_cta_link": "/solar-packages",
            "link1_text": "",
            "link1_url": "",
            "link2_text": "",
            "link2_url": "",
            "pillars": [],
        },
        "service_cards": {
            "items": [
                {
                    "title": "Residential Solar Installation",
                    "description": (
                        "Complete home solar systems designed for Ghanaian families. Reduce electricity "
                        "bills by up to 90% with reliable, grid-tied or off-grid solutions."
                    ),
                    "features": [
                        "Grid-tied & Off-grid Systems",
                        "Battery Backup Solutions",
                        "Smart Energy Monitoring",
                        "Professional Installation",
                        "10-Year Warranty",
                        "Maintenance Support",
                    ],
                    "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
                {
                    "title": "Commercial Solar Installation",
                    "description": (
                        "Large-scale solar solutions for businesses, offices, and commercial buildings. "
                        "Maximize ROI with custom-designed systems."
                    ),
                    "features": [
                        "Custom System Design",
                        "ROI Analysis & Planning",
                        "Minimal Business Disruption",
                        "Long-term Cost Savings",
                        "Scalable Solutions",
                        "24/7 Monitoring",
                    ],
                    "image": "/website_images/services-commercial-solar.png",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
                {
                    "title": "Industrial Solar Solutions",
                    "description": (
                        "Heavy-duty solar systems for factories and industrial facilities. "
                        "Power your operations with reliable, cost-effective solar energy."
                    ),
                    "features": [
                        "High-Capacity Systems",
                        "Industrial-Grade Equipment",
                        "Custom Engineering",
                        "24/7 System Monitoring",
                        "Dedicated Support Team",
                        "Energy Management",
                    ],
                    "image": "/website_images/services-industrial-solar.png",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
                {
                    "title": "Battery Storage Solutions",
                    "description": (
                        "Advanced battery storage systems for energy independence. Store solar energy "
                        "for use during power outages and peak hours."
                    ),
                    "features": [
                        "LiFePO4 Battery Technology",
                        "Long Lifespan (10+ years)",
                        "Fast Charging",
                        "Smart Management Systems",
                        "Backup Power Solutions",
                        "Grid Independence",
                    ],
                    "image": "/website_images/services-battery-storage-solutions.png",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
                {
                    "title": "Solar Energy Consultation",
                    "description": (
                        "Expert consultation to help you choose the right solar solution. Free site "
                        "assessments and energy audits for your property."
                    ),
                    "features": [
                        "Free Site Assessment",
                        "Energy Needs Analysis",
                        "Custom System Design",
                        "ROI Calculations",
                        "Financing Options",
                        "Government Incentive Guidance",
                    ],
                    "image": "/website_images/services-solar-energy-consultation.png",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
                {
                    "title": "System Maintenance & Monitoring",
                    "description": (
                        "Ongoing maintenance and monitoring services to ensure your solar system "
                        "operates at peak efficiency for years to come."
                    ),
                    "features": [
                        "Regular Maintenance Checks",
                        "Performance Monitoring",
                        "Remote System Monitoring",
                        "Quick Response Repairs",
                        "Cleaning Services",
                        "Annual System Inspections",
                    ],
                    "image": "/website_images/services-maintenance-monitoring.png",
                    "link": "/contact?action=quote",
                    "button_text": "Get a Quote",
                },
            ],
        },
        "process": {
            "badge": "OUR PROCESS",
            "title": "Simple 5-Step Installation Process",
            "subtitle": "From consultation to activation, we make going solar simple and stress-free",
            "steps": [
                {
                    "step": "01",
                    "title": "Free Consultation",
                    "desc": "Site assessment and energy needs analysis. We visit your property to understand your requirements.",
                },
                {
                    "step": "02",
                    "title": "Custom Design",
                    "desc": "Our engineers create a tailored system design optimized for your property and energy needs.",
                },
                {
                    "step": "03",
                    "title": "Equipment Selection",
                    "desc": "Choose from our premium selection of solar panels, inverters, and batteries with expert guidance.",
                },
                {
                    "step": "04",
                    "title": "Professional Installation",
                    "desc": "Certified technicians install your system with minimal disruption to your daily activities.",
                },
                {
                    "step": "05",
                    "title": "Activation & Support",
                    "desc": "System activation, training, and ongoing maintenance support to ensure optimal performance.",
                },
            ],
        },
        "guarantees": {
            "badge": "OUR GUARANTEES",
            "title": "Your Investment is Protected",
            "subtitle": "",
            "items": [
                {
                    "title": "Workmanship warranty",
                    "desc": (
                        "Installation workmanship terms are listed in your project quotation — "
                        "typically 2 years on hybrid package installs."
                    ),
                },
                {
                    "title": "Manufacturer equipment cover",
                    "desc": (
                        "Panels, inverters, and batteries carry manufacturer warranties as stated on "
                        "your invoice (commonly 5–25 years by component)."
                    ),
                },
                {
                    "title": "Post-install support",
                    "desc": (
                        "Handover documentation, optional maintenance plans, and remote monitoring "
                        "help protect uptime after commissioning."
                    ),
                },
                {
                    "title": "Engineering transparency",
                    "desc": (
                        "Load-led sizing with assumptions documented in your quote — so you know what "
                        "the system is designed to carry."
                    ),
                },
            ],
        },
        "closing_cta": {
            "title": "Ready to Start Your Solar Journey?",
            "subtitle": (
                "Get a free consultation and quote today. Our team will assess your needs "
                "and design the perfect solar solution for your home or business."
            ),
            "primary_cta_text": "Get free consultation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "",
            "secondary_cta_link": "",
            "link1_text": "Solar size estimator",
            "link1_url": "/solar-estimate",
            "link2_text": "Appliance load calculator",
            "link2_url": "/load-calculator",
        },
    },
    "shop": {
        "seo": {
            "title": "Shop Solar Equipment Ghana | Panels, Inverters & Batteries",
            "description": (
                "Browse solar panels, inverters, batteries and accessories from Energy Precisions. "
                "Website pricing in GHS with delivery and support across Ghana."
            ),
        },
        "hero": {
            "badge": "ONLINE SHOP",
            "headline": "Premium Solar Equipment",
            "description": (
                "Shop Ghana's finest selection of solar panels, inverters, batteries, and accessories. "
                "All products come with warranty and expert installation support."
            ),
        },
    },
    "contact": {
        "seo": {
            "title": "Contact Energy Precisions | Solar Ghana",
            "quote_title": "Request a Solar Quote | Energy Precisions",
            "description": (
                "Contact Energy Precisions for solar quotes, site assessments and support. "
                "Haatso, Accra — serving homes and businesses across Ghana."
            ),
        },
        "hero": {
            "title": "Let's discuss a project",
            "quote_title": "Request a Quote",
            "subtitle": "Get in touch with us for expert solar solutions",
        },
        "sidebar": {
            "phone_label": "Call For Services",
            "email_label": "Send Us Email",
            "location_label": "Visit Our Location",
        },
        "form": {
            "submit_text": "Send Us Mail",
            "success_message": "Thank you for your message. We will contact you soon.",
        },
    },
    "global": {
        "contact": {
            "name": "Energy Precisions",
            "tagline": "Seamless solar installation service you can trust",
            "logo_src": "/website_images/Logo1-1-scaled-e1752479241874.png",
            "logo_alt": "Energy Precisions logo",
            "website": "https://energyprecisions.com",
            "website_display": "www.energyprecisions.com",
            "phone": "+233533611611",
            "phone_display": "(+233) 533 611 611",
            "whatsapp": "233533611611",
            "whatsapp_display": "Chat on WhatsApp",
            "email_primary": "info@energyprecisions.com",
            "email_sales": "info@energyprecisions.com",
            "address_line1": "Haatso, Ecomog",
            "address_line2": "Accra, Ghana",
            "address_full": "Haatso, Ecomog, Accra, Ghana",
            "office_heading": "Accra office",
            "office_region_note": (
                "We operate from our Accra office. Site surveys and installations are arranged "
                "across Greater Accra and other regions by appointment."
            ),
            "google_maps_review_url": (
                "https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana"
            ),
            "google_maps_write_review_url": (
                "https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana"
            ),
            "google_maps_embed_url": (
                "https://maps.google.com/maps?q=Energy+Precisions+Haatso+Ecomog+Accra+Ghana&hl=en&z=15&output=embed"
            ),
        },
        "social": {
            "facebook": "https://www.facebook.com/energyprecisions",
            "twitter": "https://twitter.com/energyprecisions",
            "linkedin": "https://www.linkedin.com/company/energyprecisions",
            "instagram": "https://www.instagram.com/energyprecisions",
        },
        "cta": {
            "consultation": "Get free consultation",
            "quote": "Get free consultation",
            "quote_href": "/contact?action=quote",
            "survey_href": "/contact?action=quote&topic=package",
        },
        "hero_stats": {
            "items": [
                {"value": "6.5–20 kVA", "label": "Hybrid package range"},
                {"value": "16 kWh", "label": "LiFePO₄ storage modules"},
                {"value": "Accra HQ", "label": "Ghana-wide installs"},
            ],
        },
        "impact_stats": {
            "title": "What we deliver",
            "items": [
                {
                    "value": "6",
                    "label": "Package tiers",
                    "description": (
                        "Published hybrid tiers from 6.5 kVA essential homes through 20 kVA light "
                        "commercial — each with defined load ceilings."
                    ),
                },
                {
                    "value": "16 kWh",
                    "label": "LiFePO₄ modules",
                    "description": (
                        "Stocked lithium battery blocks used across our hybrid package line; module "
                        "count confirmed on site survey."
                    ),
                },
                {
                    "value": "1",
                    "label": "Accra office",
                    "description": (
                        "Haatso, Ecomog headquarters — engineering, quotes, and install scheduling "
                        "for projects across Ghana."
                    ),
                },
            ],
        },
        "warranty_summary": {
            "headline": "Documented warranty coverage",
            "workmanship": (
                "Installation workmanship terms are confirmed in your project quotation — typically "
                "2 years on hybrid package installs."
            ),
            "equipment": (
                "Panels, inverters, and lithium batteries carry manufacturer warranties (commonly "
                "5–25 years depending on model). Final coverage is listed on your invoice."
            ),
            "shop_note": (
                "Shop purchases without installation include manufacturer warranty only; extended "
                "workmanship requires a signed install agreement."
            ),
            "details_path": "/warranty",
        },
        "header": {
            "menu_items": [
                {"label": "Home", "path": "/"},
                {"label": "Our Company", "path": "/about"},
                {
                    "label": "Services",
                    "path": "/services",
                    "submenu": [
                        {"label": "Residential Solar", "path": "/services#residential"},
                        {"label": "Commercial Solar", "path": "/services#commercial"},
                        {"label": "Industrial Solar", "path": "/services#industrial"},
                        {"label": "Agricultural Solar", "path": "/services#agricultural"},
                        {"label": "Battery Storage", "path": "/services#battery"},
                        {"label": "FAQs", "path": "/faqs"},
                    ],
                },
                {"label": "Portfolio", "path": "/portfolio"},
                {"label": "Solar Packages", "path": "/solar-packages"},
                {"label": "Shop", "path": "/shop"},
                {"label": "Financing", "path": "/financing"},
                {
                    "label": "Resources",
                    "path": "/blog",
                    "submenu": [
                        {"label": "Solar estimate", "path": "/solar-estimate"},
                        {"label": "Load calculator", "path": "/load-calculator"},
                        {"label": "Referral program", "path": "/referral"},
                    ],
                },
                {"label": "Contact", "path": "/contact"},
            ],
        },
        "google_reviews": {
            "rating": 0,
            "review_count": 0,
            "place_id": "",
        },
        "footer": {
            "company_name": "Energy Precisions",
            "tagline": (
                "Turnkey solar design, installation, and lifecycle support for homes and businesses across Ghana."
            ),
            "quick_links_title": "Explore",
            "quick_links": [
                {"label": "Home", "path": "/"},
                {"label": "About us", "path": "/about"},
                {"label": "Portfolio", "path": "/portfolio"},
                {"label": "Shop", "path": "/shop"},
                {"label": "Financing", "path": "/financing"},
                {"label": "Solar in Accra", "path": "/solar-accra"},
                {"label": "Solar in Kumasi", "path": "/solar-kumasi"},
                {"label": "Get a quote", "path": "/contact?action=quote"},
            ],
            "other_links_title": "Company",
            "other_links": [
                {"label": "Contact", "path": "/contact"},
                {"label": "Blog", "path": "/blog"},
                {"label": "Client reviews", "path": "/reviews"},
                {"label": "Referral program", "path": "/referral"},
            ],
            "service_links_title": "Services",
            "service_links": [
                {"label": "All services", "path": "/services"},
                {"label": "Residential solar", "path": "/services#residential"},
                {"label": "Commercial solar", "path": "/services#commercial"},
                {"label": "Industrial solar", "path": "/services#industrial"},
                {"label": "Battery storage", "path": "/services#battery"},
                {"label": "Agricultural solar", "path": "/services#agricultural"},
                {"label": "Maintenance", "path": "/services"},
            ],
            "tools_links_title": "Tools & resources",
            "tools_links": [
                {"label": "Solar size estimator", "path": "/solar-estimate"},
                {"label": "Load calculator", "path": "/load-calculator"},
                {"label": "FAQs", "path": "/faqs"},
                {"label": "Hybrid packages", "path": "/solar-packages"},
                {"label": "Warranty", "path": "/warranty"},
            ],
            "legal_links": [
                {"label": "Privacy policy", "path": "/privacy"},
                {"label": "Terms of use", "path": "/terms"},
            ],
            "newsletter_title": "Newsletter",
            "newsletter_text": "Occasional updates on solar, projects, and offers — no spam.",
            "subscribe_button": "Subscribe",
            "copyright": "© {year} Energy Precisions. All rights reserved.",
        },
    },
    "packages": {
        "seo": {
            "title": "Hybrid Lithium Solar Packages Ghana | Energy Precisions",
            "description": (
                "Turnkey 6.5–20 kVA hybrid lithium solar packages from our Accra office — panels, "
                "installation, monitoring and free site assessment across Ghana."
            ),
        },
        "hero": {
            "badge": "LiFePO₄ LITHIUM STORAGE",
            "headline": "Hybrid Lithium Solar Packages",
            "description": (
                "Hybrid solar with lithium backup (grid + generator ready). Turnkey supply, roof "
                "mounting, protection, commissioning, and monitoring."
            ),
            "primary_cta_text": "Book free site assessment",
            "primary_cta_link": "/contact?action=quote&topic=package",
            "secondary_cta_text": "Call us",
            "secondary_cta_link": "tel:+233533611611",
        },
        "packages_section": {
            "title": "Choose your package",
            "subtitle": (
                "Six turnkey tiers from essential homes to commercial blocks. KVA is your planned "
                "load tier; inverter and panel lines follow what we stock and engineer — see notes "
                "on each card."
            ),
        },
        "reading_guide": {
            "title": "How to read these packages",
            "points": [
                "KVA on the badge = your load tier (how much you plan to run at once), not the inverter brand size.",
                "Watts shown (~0.85 × kVA) = continuous planning ceiling — stagger AC, iron, and heaters.",
                "Inverter line = equipment we stock; it may be larger than the kVA badge for AC starts and reliability.",
                "Panel count = sized to the kVA load tier, not to fill a larger inverter — survey may adjust.",
                "Hybrid = solar + lithium + grid (generator-ready); backup hours depend on battery size and night load.",
                "Pricing is tailored to your site — book a free assessment and we confirm the final BOM and quote after survey.",
            ],
        },
        "why_section": {
            "title": "Why Energy Precisions",
            "features": [
                {
                    "title": "Engineered, not guessed",
                    "description": "Site survey and load confirmation before final BOM.",
                },
                {
                    "title": "LiFePO₄ lithium",
                    "description": "Safer chemistry and long cycle life for daily cycling.",
                },
            ],
            "footer_points": [
                "A larger inverter than the kVA badge is normal: it covers motor starts and growth while you still plan within the stated watt ceiling.",
                "Solar panel counts follow the package load tier (kVA), not the inverter nameplate — avoids paying for PV you cannot use on that load.",
                "Storage uses stocked 16 kWh LiFePO₄ modules; night backup hours depend on your load — survey confirms module count.",
                "Commercial and Power tiers need a load schedule on survey; brochure lists are typical examples, not unlimited simultaneous use.",
                "Larger projects receive engineered BOM, load analysis, and itemised quotation from Energy Precisions.",
                "Typical payment: 30% deposit · 40% on delivery · 30% on commissioning (negotiable for commercial clients).",
            ],
            "warranty_note": (
                "Premium 16 kWh LiFePO₄ batteries · 5-year battery warranty (manufacturer) · "
                "2-year workmanship on installation."
            ),
            "validity_note": (
                "Every project starts with a free site assessment — final design and pricing are confirmed after survey."
            ),
            "contact_cta_text": "Book free site assessment & quote",
        },
        "tier_prices": {
            "ep-6.5kva": 140900,
            "ep-8kva": 194900,
            "ep-10kva": 229900,
            "ep-12kva": 286900,
            "ep-15kva": 353900,
            "ep-20kva": 447900,
        },
    },
    "financing": {
        "seo": {
            "title": "Solar Financing Ghana | Payment Options | Energy Precisions",
            "description": (
                "Financing and staged payment paths for solar projects in Ghana. Transparent quotes, "
                "engineering-led sizing and maintenance — Energy Precisions."
            ),
        },
        "hero": {
            "badge": "SOLAR FOR EVERYONE",
            "headline": "Financing & payment paths that fit your project",
            "description": (
                "We are rolling out structured financing and staged-payment options alongside our "
                "turnkey design, installation, and maintenance. Tell us about your site and load "
                "profile—we will map the clearest path forward and only recommend what we can "
                "actually deliver."
            ),
            "primary_cta_text": "Request a financing conversation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "General contact",
            "secondary_cta_link": "/contact",
        },
        "hero_cards": [
            {
                "title": "How we work with you",
                "body": (
                    "Clear proposal, transparent line items, and a maintenance story after "
                    "commissioning—so lenders and finance partners (when engaged) see a serious, "
                    "documented project."
                ),
            },
            {
                "title": "What we are building toward",
                "body": (
                    "Partnerships with banks and asset financiers are part of our roadmap. Until "
                    "each program is live, we will not advertise rates or products we cannot honour."
                ),
            },
        ],
        "content": {
            "title": "Today: practical ways to move your project forward",
            "subtitle": (
                "Many customers combine equipment purchases from our shop with a custom engineered "
                "install. We can discuss milestones, retainers, and documentation you need for your "
                "own financing—without promising third-party approval we do not control."
            ),
            "steps_title": "Typical next steps",
            "steps": [
                "Site assessment and load / tariff review",
                "Engineering-led system sizing and bill-of-materials",
                "Formal quote with clear phases (equipment, install, commissioning)",
                "Optional maintenance and monitoring plan after handover",
            ],
            "talk_title": "Talk to the team",
            "talk_body": (
                "For residential, commercial, agricultural, or hybrid sites, we start with your "
                "goals and constraints—then align equipment and installation scope before any "
                "financing discussion."
            ),
            "talk_cta_text": "Start with a quote request",
            "talk_cta_link": "/contact?action=quote",
            "payg_title": "PAYG-style & staged payment options",
            "payg_body": (
                "For customers comparing plans like pay-as-you-go solar or bank-backed asset "
                "finance, we map your site load, equipment, and installation phases first—then "
                "align with partner programmes where they are live and documented. We do not "
                "publish rates here because products and eligibility change."
            ),
            "payg_footer": (
                "Mention financing or PAYG in your quote request so we route you to the right "
                "conversation."
            ),
            "payment_calculator_title": "Example monthly payment",
            "payment_calculator_subtitle": (
                "Indicative only — actual terms depend on project size, lender, and your quote. "
                "Request a formal proposal for binding numbers."
            ),
        },
    },
    "portfolio": {
        "seo": {
            "title": "Solar Project Portfolio Ghana | Energy Precisions",
            "description": (
                "Residential, commercial, industrial and community solar projects across Ghana — "
                "design, installation and support from Energy Precisions."
            ),
        },
        "hero": {
            "badge": "OUR WORK",
            "headline": "Projects That Power Ghana",
            "description": (
                "Explore our completed solar installations across residential, commercial, "
                "and industrial sectors."
            ),
        },
        "items": [],
        "closing_cta": {
            "title": "Start your solar project",
            "subtitle": "Join hundreds of satisfied customers across Ghana.",
            "primary_cta_text": "Get free consultation",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "View packages",
            "secondary_cta_link": "/solar-packages",
        },
    },
    "blog": {
        "seo": {
            "title": "Solar Resources & Insights | Energy Precisions Ghana",
            "description": (
                "Practical articles on solar sizing, grid-tied and hybrid systems, and getting "
                "accurate quotes in Ghana — from Energy Precisions."
            ),
        },
        "hero": {
            "badge": "Resources",
            "headline": "Solar insights for homes and businesses",
            "description": (
                "Short guides you can trust — no hype, just how we think about design, tariffs, "
                "and backup when we engineer systems in Ghana."
            ),
        },
    },
    "reviews": {
        "seo": {
            "title": "Client Reviews | Solar Ghana | Energy Precisions",
            "description": (
                "What residential, commercial and industrial clients say about Energy Precisions "
                "solar design, installation and support across Ghana."
            ),
        },
        "hero": {
            "badge": "Client reviews",
            "headline": "Trusted across Ghana",
            "description": (
                "Real feedback from homeowners, businesses and facility managers who switched "
                "to solar with Energy Precisions."
            ),
        },
    },
    "referral": {
        "seo": {
            "title": "Solar Champions Referral Program | Energy Precisions",
            "description": (
                "Refer homes and businesses to Energy Precisions for solar in Ghana. Ask about "
                "our referral rewards for successful installations."
            ),
        },
        "hero": {
            "badge": "Solar champions",
            "headline": "Referral program",
            "description": (
                "Help friends, family, and businesses go solar. Share a lead today — we confirm "
                "eligibility and reward terms with you directly."
            ),
        },
    },
    "privacy": {
        "seo": {
            "title": "Privacy Policy | Energy Precisions",
            "description": (
                "How Energy Precisions collects, uses, and protects your personal information "
                "when you use our website and services."
            ),
        },
        "hero": {
            "badge": "Legal",
            "headline": "Privacy Policy",
            "description": (
                "How Energy Precisions collects, uses, and protects your personal information "
                "when you use our website and services."
            ),
        },
        "content_sections": [
            {
                "title": "Information we collect",
                "body": (
                    "We may collect your name, email address, phone number, property or business "
                    "location, energy usage details, and any information you submit through contact "
                    "forms, quote requests, shop checkout, newsletter signup, or referral program enquiries."
                ),
            },
            {
                "title": "How we use your information",
                "body": (
                    "We use this information to respond to enquiries, prepare quotations, deliver "
                    "solar design and installation services, process shop orders, send service updates "
                    "you have requested, and improve our website and customer experience."
                ),
            },
            {
                "title": "Sharing and storage",
                "body": (
                    "We do not sell your personal data. We may share information with trusted service "
                    "providers (such as payment processors or logistics partners) only where needed to "
                    "fulfil your request. Data is stored on secure systems with access limited to authorised staff."
                ),
            },
            {
                "title": "Your choices",
                "body": (
                    "You may request access to, correction of, or deletion of your personal data by "
                    "contacting us at info@energyprecisions.com. You can unsubscribe from marketing emails "
                    "at any time using the link in our messages."
                ),
            },
            {
                "title": "Contact",
                "body": (
                    "Energy Precisions\nHaatso, Ecomog, Accra, Ghana\nPhone: (+233) 533 611 611\n"
                    "Email: info@energyprecisions.com"
                ),
            },
        ],
    },
    "terms": {
        "seo": {
            "title": "Terms of Use | Energy Precisions",
            "description": "Terms governing use of the Energy Precisions website, tools, and online services.",
        },
        "hero": {
            "badge": "Legal",
            "headline": "Terms of Use",
            "description": "Terms governing use of the Energy Precisions website, tools, and online services.",
        },
        "content_sections": [
            {
                "title": "Use of this website",
                "body": (
                    "By accessing energyprecisions.com you agree to use this site for lawful purposes only. "
                    "Content is provided for general information about our solar products and services in Ghana "
                    "and does not constitute a binding offer until confirmed in writing."
                ),
            },
            {
                "title": "Quotes, pricing, and projects",
                "body": (
                    "Solar system sizing, pricing, and availability depend on site survey and engineering "
                    "assessment. Package tiers, estimator outputs, and load calculator results are "
                    "indicative only. Final quotations are provided after a free site assessment and may "
                    "differ after technical review."
                ),
            },
            {
                "title": "Shop and payments",
                "body": (
                    "Product orders are subject to stock availability and confirmed order acceptance. Payment "
                    "terms for equipment and installation projects are set out in your quotation or invoice. "
                    "Warranty coverage follows manufacturer and Energy Precisions workmanship terms supplied with your project."
                ),
            },
            {
                "title": "Intellectual property",
                "body": (
                    "All website content, branding, photography, and documentation remain the property of "
                    "Energy Precisions or its licensors. You may not reproduce or redistribute materials without "
                    "prior written permission."
                ),
            },
            {
                "title": "Limitation of liability",
                "body": (
                    "To the fullest extent permitted by law, Energy Precisions is not liable for indirect or "
                    "consequential loss arising from use of this website or reliance on general information published here. "
                    "Nothing in these terms limits rights you may have under applicable Ghanaian consumer law."
                ),
            },
            {
                "title": "Contact",
                "body": "Questions about these terms: info@energyprecisions.com or (+233) 533 611 611.",
            },
        ],
    },
    "warranty": {
        "seo": {
            "title": "Warranty & Coverage | Energy Precisions",
            "description": (
                "How Energy Precisions protects your solar investment — workmanship, equipment, "
                "and what to expect after installation."
            ),
        },
        "hero": {
            "badge": "Support",
            "headline": "Warranty & coverage",
            "description": (
                "How Energy Precisions protects your solar investment — workmanship, equipment, "
                "and what to expect after installation."
            ),
        },
        "content_sections": [
            {
                "title": "Installation workmanship",
                "body": (
                    "Energy Precisions provides a workmanship warranty on professional installation — covering "
                    "mounting, wiring, commissioning, and labelled distribution. Terms and duration are confirmed "
                    "in your project quotation and handover documents."
                ),
            },
            {
                "title": "Solar panels",
                "body": (
                    "Tier-1 modules supplied through Energy Precisions carry manufacturer product and performance "
                    "warranties, typically 10–12 years product and 25–30 years linear performance (exact terms vary by brand and batch)."
                ),
            },
            {
                "title": "Inverters & batteries",
                "body": (
                    "Inverter and lithium battery warranties follow the manufacturer — commonly 5–10 years depending "
                    "on model. Hybrid packages on our website note battery warranty on each tier card; final coverage is listed on your invoice."
                ),
            },
            {
                "title": "Shop equipment-only orders",
                "body": (
                    "Products purchased from our online shop without installation carry manufacturer warranty only. "
                    "Installation, commissioning, and extended workmanship coverage require a separate site survey and project agreement."
                ),
            },
            {
                "title": "Maintenance & monitoring",
                "body": (
                    "Optional maintenance plans and remote monitoring help protect uptime and validate warranty claims. "
                    "Contact us after handover to schedule annual checks or to report a fault."
                ),
            },
            {
                "title": "Making a claim",
                "body": (
                    "Email info@energyprecisions.com or call (+233) 533 611 611 with your order or project reference, "
                    "photos of the issue, and inverter/battery serial numbers where applicable. We will route you to the "
                    "correct manufacturer or dispatch a technician."
                ),
            },
        ],
    },
    "locations": {
        "items": [],
    },
    "faqs": {
        "seo": {
            "title": "Solar FAQs Ghana | Energy Precisions",
            "description": (
                "Answers to common questions about solar panels, installation, batteries, costs and "
                "maintenance in Ghana — from Energy Precisions."
            ),
        },
        "hero": {
            "badge": "Support",
            "headline": "Frequently asked questions",
            "description": (
                "Have questions about solar in Ghana? Start here — or use our planning tools for a "
                "rough sizing estimate."
            ),
        },
    },
    "solar_estimate": {
        "seo": {
            "title": "Solar System Size Estimator Ghana | Ballpark kW | Energy Precisions",
            "description": (
                "Rough, non-binding estimate of solar array size from monthly energy use or bill. "
                "For an engineered quote, contact Energy Precisions in Accra."
            ),
        },
        "hero": {
            "badge": "Planning tool",
            "headline": "Ballpark solar size calculator",
            "description": (
                "Indicative numbers only — roof, shading, equipment, and grid rules change every project. "
                "Our engineers confirm sizing on site."
            ),
        },
    },
    "load_calculator": {
        "seo": {
            "title": "Appliance Load Calculator Ghana | Energy Precisions",
            "description": (
                "Estimate daily kWh from typical appliances using Energy Precisions load rules. "
                "Indicative only — not a quotation."
            ),
        },
        "hero": {
            "badge": "Planning tool",
            "headline": "Appliance load calculator",
            "description": (
                "Pick typical appliances from our catalog, adjust how many you run and for how long each day. "
                "Results are indicative — your engineer confirms everything on site."
            ),
        },
    },
}


def deep_merge(base: Any, override: Any) -> Any:
    if not isinstance(override, dict):
        return copy.deepcopy(override)
    result = copy.deepcopy(base) if isinstance(base, dict) else {}
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result


def get_page_defaults(page: str) -> Dict[str, Any]:
    if page not in _DEFAULTS:
        return {}
    result = copy.deepcopy(_DEFAULTS[page])
    if page == "portfolio":
        from app.portfolio_defaults import get_default_portfolio_items

        bundled = get_default_portfolio_items()
        if bundled and not result.get("items"):
            result["items"] = bundled
    if page == "locations":
        from app.location_defaults import get_default_location_items

        bundled = get_default_location_items()
        if bundled and not result.get("items"):
            result["items"] = bundled
    return result


def merge_page_sections(page: str, stored: Dict[str, Any] | None) -> Dict[str, Any]:
    defaults = get_page_defaults(page)
    if not stored:
        return defaults
    merged = deep_merge(defaults, stored)
    # Explicit empty gallery in DB must not wipe bundled install photos.
    if page == "portfolio" and stored.get("items") == []:
        merged["items"] = defaults.get("items", [])
    if page == "locations" and stored.get("items") == []:
        merged["items"] = defaults.get("items", [])
    return merged
