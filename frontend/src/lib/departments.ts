// Shared department data — the 8 student-run teams that make up AquaTerra.
// Lives in its own module so both EverythingWeDoPage and QuickLinksPage can
// import it without coupling their lazy chunks together.

export interface Department {
  name: string
  color: string
  icon: string
  desc: string
  stat: string
  category: string
}

export const DEPARTMENTS: Department[] = [
  {
    name: 'Events',
    color: '#FF7A1A',
    icon: '🎪',
    desc: 'Paradox, Disco Diwali, Starry Nights, awareness events. AQ-run fundraisers have crossed 6-digit revenue. This team plans and executes every large-scale gathering.',
    stat: '300+ attendees at Paradox 3.0',
    category: 'events',
  },
  {
    name: 'Welfare Projects',
    color: '#00E5A0',
    icon: '🌱',
    desc: 'Teaching workshops, Sundarbans relief trips, dog feeding drives, plantation drives, old age home visits, clothes distribution. 3,500+ kids reached in educational workshops.',
    stat: '8 Sundarbans trips, 4,000+ saplings',
    category: 'welfare',
  },
  {
    name: 'Social Media',
    color: '#FF6BD6',
    icon: '📱',
    desc: 'Instagram (@ngo.aquaterra), LinkedIn, website, reels, carousels, copy. 3,200+ followers. Real brand work by student creators who show up every week.',
    stat: '3,200+ followers on Instagram',
    category: 'content',
  },
  {
    name: 'Collabs',
    color: '#FFC700',
    icon: '🤝',
    desc: 'School collabs, college partnerships, inter-NGO collaborations. AQ grows through peer networks. The Collabs team builds those networks.',
    stat: 'Partnerships across Kolkata',
    category: 'operations',
  },
  {
    name: 'ROOTS',
    color: '#7E5BFF',
    icon: '👕',
    desc: 'Student-run streetwear brand. Design, production, sales. Profits fund welfare projects and events. This is not a concept. The brand ships real merch.',
    stat: 'Revenue funds AQ operations',
    category: 'content',
  },
  {
    name: 'AQ.Ventures',
    color: '#3DA9FC',
    icon: '🚀',
    desc: 'A free marketing agency for student businesses. Real clients. Real briefs. Real deliverables. Members get live marketing experience before college.',
    stat: 'Pro-bono for student businesses',
    category: 'operations',
  },
  {
    name: 'ShikshAQ',
    color: '#FF4D8C',
    icon: '📚',
    desc: 'Tuition discovery platform built by AQ members for students across Kolkata. Launched 2026. Product, growth, content. Still early. Team is small and moving fast.',
    stat: 'Live as of 2026',
    category: 'labs',
  },
  {
    name: 'Human Resources',
    color: '#FFE94A',
    icon: '👥',
    desc: 'Recruitment, onboarding, certificates, Letters of Recommendation. HR runs the intake pipeline for 1,200+ members. First people new joiners meet.',
    stat: '1,200+ members onboarded',
    category: 'operations',
  },
]
