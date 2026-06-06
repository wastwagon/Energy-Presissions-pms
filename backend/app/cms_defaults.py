"""Default CMS page sections — merged with DB overrides on read."""
from __future__ import annotations

import copy
from typing import Any, Dict

CMS_PAGES = ("home", "about", "services", "shop", "contact", "global", "packages", "financing")

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
            "stats": [
                {"value": "500+", "label": "Installations"},
                {"value": "10+", "label": "Years Experience"},
                {"value": "98%", "label": "Customer Satisfaction"},
            ],
            "primary_cta_text": "Get Free Quote",
            "primary_cta_link": "/contact?action=quote",
            "secondary_cta_text": "Browse Products",
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
                    "primary_cta_text": "Get Free Quote",
                    "primary_cta_link": "/contact?action=quote",
                    "secondary_cta_text": "Browse Products",
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
                    "secondary_cta_text": "Book site survey",
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
                    "primary_cta_text": "Request a consultation",
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
                        "Our certified technicians have installed over 500 solar systems across "
                        "Ghana. Professional installation ensures maximum efficiency and longevity."
                    ),
                },
                {
                    "title": "Comprehensive Warranty",
                    "description": (
                        "10-year warranty on installations, 25-year panel warranty, and lifetime "
                        "support. Your investment is protected with our comprehensive coverage."
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
                        "Join thousands of Ghanaians reducing electricity costs and carbon footprint. "
                        "Make a positive impact on Ghana's energy future."
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
                    "link": "/services/residential",
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
                    "link": "/services/commercial",
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
                    "link": "/services/industrial",
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
                    "link": "/contact?action=quote",
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
                    "link": "/services/battery",
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
            "primary_cta_text": "Get Free Consultation",
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
            "stats": [
                {"value": "500+", "label": "Installations"},
                {"value": "10+", "label": "Years Experience"},
                {"value": "98%", "label": "Satisfaction Rate"},
            ],
            "primary_cta_text": "Get Free Quote",
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
                        "10+ years in business, 500+ successful installations, and 98% customer "
                        "satisfaction. Your trust is our greatest asset."
                    ),
                },
                {
                    "title": "Proven Track Record",
                    "description": (
                        "Trusted by residential, commercial, and industrial clients across Accra, "
                        "Kumasi, Tamale, and beyond."
                    ),
                },
                {
                    "title": "Sustainable Future",
                    "description": (
                        "Join thousands of Ghanaians reducing electricity costs and carbon footprint. "
                        "Together, we build a greener Ghana."
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
            "title": "Our Impact in Numbers",
            "items": [
                {
                    "value": "500+",
                    "label": "Installations",
                    "description": (
                        "Solar systems delivered across Ghana — residential, commercial, and industrial."
                    ),
                },
                {
                    "value": "98%",
                    "label": "Client Satisfaction",
                    "description": (
                        "Clients who recommend us for quality equipment, installation, and after-sales support."
                    ),
                },
                {
                    "value": "10+",
                    "label": "Years Experience",
                    "description": (
                        "A decade of engineering, installation, and lifecycle support in the Ghana market."
                    ),
                },
            ],
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
                    "title": "10-Year Installation Warranty",
                    "desc": "Comprehensive warranty covering all installation work and system performance.",
                },
                {
                    "title": "25-Year Panel Warranty",
                    "desc": "Manufacturer warranty on all solar panels, ensuring long-term performance.",
                },
                {
                    "title": "Free Maintenance (First Year)",
                    "desc": "Complimentary maintenance and system checks for the first year after installation.",
                },
                {
                    "title": "Performance Guarantee",
                    "desc": "We guarantee your system will meet or exceed projected energy generation.",
                },
            ],
        },
        "closing_cta": {
            "title": "Ready to Start Your Solar Journey?",
            "subtitle": (
                "Get a free consultation and quote today. Our team will assess your needs "
                "and design the perfect solar solution for your home or business."
            ),
            "primary_cta_text": "Get Free Consultation",
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
        "footer": {
            "company_name": "Energy Precisions",
            "tagline": (
                "Turnkey solar design, installation, and lifecycle support for homes and businesses across Ghana."
            ),
            "quick_links_title": "Explore",
            "quick_links": [
                {"label": "About", "path": "/about"},
                {"label": "Services", "path": "/services"},
                {"label": "Portfolio", "path": "/portfolio"},
                {"label": "Shop", "path": "/shop"},
                {"label": "Financing", "path": "/financing"},
                {"label": "Get a quote", "path": "/contact?action=quote"},
            ],
            "other_links_title": "Company",
            "other_links": [
                {"label": "Contact", "path": "/contact"},
                {"label": "Blog", "path": "/blog"},
                {"label": "Client reviews", "path": "/#testimonials"},
            ],
            "service_list_title": "Services",
            "service_list": [
                "Residential solar",
                "Commercial solar",
                "Energy storage",
                "Maintenance & monitoring",
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
                "installation, monitoring and competitive GHS pricing across Ghana."
            ),
        },
        "hero": {
            "badge": "LiFePO₄ LITHIUM STORAGE",
            "headline": "Hybrid Lithium Solar Packages",
            "description": (
                "Hybrid solar with lithium backup (grid + generator ready). Turnkey supply, roof "
                "mounting, protection, commissioning, and monitoring."
            ),
            "primary_cta_text": "Book free site survey",
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
                "Turnkey price is from our Accra office; final BOM and price are confirmed after a free site survey.",
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
                "Prices valid until December 2026. Final design is confirmed after a free site survey."
            ),
            "contact_cta_text": "Request a formal quotation",
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
    return copy.deepcopy(_DEFAULTS[page])


def merge_page_sections(page: str, stored: Dict[str, Any] | None) -> Dict[str, Any]:
    defaults = get_page_defaults(page)
    if not stored:
        return defaults
    return deep_merge(defaults, stored)
