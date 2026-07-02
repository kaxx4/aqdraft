export interface MetaConfig {
  title: string
  description: string
  image?: string
  path: string
  type?: 'website' | 'article' | 'profile'
}

export const pageMetadata: Record<string, MetaConfig> = {
  home: {
    title: 'AquaTerra | Student-Led Community in Kolkata',
    description: 'AquaTerra: a student-led community in Kolkata where 1,200+ teenagers take ownership of real projects, build leadership skills, and create social impact. Join our ecosystem today.',
    image: '',
    path: '/',
  },
  about: {
    title: 'About AquaTerra | Youth Leadership & Real Impact',
    description: 'Discover AquaTerra\'s story: how a student-led ecosystem in Kolkata transformed youth engagement by combining ownership, real impact, and community. Founded on student leadership principles.',
    image: '',
    path: '/about',
  },
  everythingWeDo: {
    title: 'Everything We Do | Student-Led Initiatives',
    description: 'Everything AquaTerra does: ROOTS welfare projects, ShikshAQ education platform, AQ.Ventures marketing agency, and 512+ student-led initiatives creating real impact in Kolkata.',
    image: '',
    path: '/everything-we-do',
  },
  projects: {
    title: 'Student-Led Projects | AquaTerra Community',
    description: '512+ student-led projects: education workshops, welfare drives, environmental initiatives, and community work led by teenagers in Kolkata. Real execution, real impact.',
    image: '',
    path: '/projects',
  },
  aqLabs: {
    title: 'AQ Labs | Student-Built Innovation, AquaTerra',
    description: "AQ Labs is AquaTerra's innovation showcase: real products, apps and hardware built by student teams — CareerCompass, Wisdom Woods, Hunar, QUIRK, Photon, Cirqle Rentals and Karyaarth. See what recognition and resources can build.",
    image: '',
    path: '/aq-labs',
  },
  projectDetail: {
    title: '{projectName} | Student-Led Project',
    description: '{projectName}: A student-led project by AquaTerra bringing real impact to Kolkata. {projectDescription}. Led by young people taking ownership of community work.',
    image: '{projectImage}',
    path: '/projects/:slug',
  },
  blog: {
    title: 'Blog | Student Stories & Youth Leadership Insights',
    description: 'AquaTerra stories: read how students execute real projects, build leadership, create impact. Youth insights from our Kolkata-based student community.',
    image: '',
    path: '/blog',
  },
  blogPost: {
    title: '{postTitle} | AquaTerra Student Community',
    description: '{postExcerpt}',
    image: '{postImage}',
    path: '/blog/:slug',
    type: 'article',
  },
  schools: {
    title: 'Schools in AquaTerra | Student Community Network',
    description: 'Schools in AquaTerra community: connected schools in Kolkata, grades 9-12. Find student-led initiatives in your school network.',
    image: '',
    path: '/schools',
  },
  classes: {
    title: 'Classes & Learning | AquaTerra',
    description: 'Browse available learning programs and batches from AquaTerra. Educational initiatives by student leaders.',
    image: '',
    path: '/classes',
  },
  collaborations: {
    title: 'Collaborations & Partnerships | AquaTerra',
    description: 'Discover partnerships between AquaTerra and organizations creating student-led impact in Kolkata.',
    image: '',
    path: '/collaborations',
  },
  contact: {
    title: 'Contact AquaTerra | Partnerships & Inquiries',
    description: 'Contact AquaTerra for partnerships, student opportunities, volunteering, or questions about our community.',
    image: '',
    path: '/contact',
  },
  faq: {
    title: 'FAQ | Questions About Joining AquaTerra',
    description: 'Find answers about AquaTerra membership, student-led projects, volunteering, and how to show up and do the work.',
    image: '',
    path: '/faq',
  },
  opportunities: {
    title: 'Student Opportunities & Volunteering | AquaTerra',
    description: 'Student opportunities at AquaTerra: volunteer in real projects, build leadership skills, join youth-led teams, create community impact. Kolkata-based student community.',
    image: '',
    path: '/opportunities',
  },
  support: {
    title: 'Support | AquaTerra Community Resources',
    description: 'Get support and find resources for AquaTerra members. Questions about student opportunities, projects, or participation.',
    image: '',
    path: '/support',
  },
  volunteer: {
    title: 'Volunteer Handbook | Join AquaTerra Today',
    description: 'Volunteer handbook: join AquaTerra\'s student-led community, take ownership of real projects, develop youth leadership skills, create social impact in Kolkata.',
    image: '',
    path: '/volunteer',
  },
  volunteerThankYou: {
    title: 'Thank You | Welcome to AquaTerra',
    description: 'Welcome to AquaTerra! Thank you for your interest in our student-led community. You\'re joining 1,200+ youth leaders.',
    image: '',
    path: '/volunteer/thank-you',
  },
  login: {
    title: 'Log In | AquaTerra',
    description: 'Sign in to your AquaTerra community account.',
    image: '',
    path: '/login',
  },
  register: {
    title: 'Join AquaTerra | Register Now',
    description: 'Create your account and join the AquaTerra community today.',
    image: '',
    path: '/register',
  },
  settings: {
    title: 'Settings | AquaTerra',
    description: 'Manage your AquaTerra account settings and preferences.',
    image: '',
    path: '/settings',
  },
  pendingApproval: {
    title: 'Pending Approval | AquaTerra',
    description: 'Your AquaTerra account is pending approval. Check back soon!',
    image: '',
    path: '/pending-approval',
  },
  rejected: {
    title: 'Application Status | AquaTerra',
    description: 'Your AquaTerra application status.',
    image: '',
    path: '/rejected',
  },
  myPosts: {
    title: 'My Posts | Your Work on AquaTerra',
    description: 'Your posts: updates on student-led projects and real community work with AquaTerra.',
    image: '',
    path: '/my-posts',
  },
  savedPosts: {
    title: 'Saved Posts | AquaTerra',
    description: 'Your saved posts and bookmarks from AquaTerra community members and projects.',
    image: '',
    path: '/saved-posts',
  },
  notifications: {
    title: 'Notifications | Stay Connected',
    description: 'Stay updated with your AquaTerra community notifications and activity updates.',
    image: '',
    path: '/notifications',
  },
  profile: {
    title: 'My Profile | AquaTerra Community',
    description: 'View and edit your AquaTerra profile. Share what you have built with the community.',
    image: '{userAvatar}',
    path: '/profile',
    type: 'profile',
  },
  editProfile: {
    title: 'Edit Profile | Customize Your AquaTerra',
    description: 'Update your AquaTerra community profile information and share your student leadership story.',
    image: '',
    path: '/edit-profile',
  },
  publicProfile: {
    title: '{userName} | AquaTerra Student Leader',
    description: '{userName}, AquaTerra member: a student leader running real projects and community work in Kolkata.',
    image: '{userAvatar}',
    path: '/member/:uuid',
    type: 'profile',
  },
  post: {
    title: '{postTitle} | Student Community Post',
    description: '{postExcerpt}',
    image: '{postImage}',
    path: '/post/:uuid',
    type: 'article',
  },
  teams: {
    title: 'Student-Led Teams | AquaTerra',
    description: 'AquaTerra teams: student-led groups executing projects in welfare, events, marketing, operations. See how teenagers build leadership through real responsibility.',
    image: '',
    path: '/teams',
  },
  teamDetail: {
    title: '{teamName} | AquaTerra Student Team',
    description: '{teamName}, AquaTerra\'s {category} team: a student-led group running real projects in Kolkata.',
    image: '{teamImage}',
    path: '/teams/:uuid',
  },
  search: {
    title: 'Search AquaTerra | Find Members, Projects & Teams',
    description: 'Search AquaTerra: discover student leaders, youth-led projects, community teams, and impact initiatives across our Kolkata community.',
    image: '',
    path: '/search',
  },
  directorDashboard: {
    title: 'Director Dashboard | Manage Student Community',
    description: 'Manage and monitor AquaTerra community activities. Oversee student-led projects, teams, and member engagement.',
    image: '',
    path: '/director/dashboard',
  },
  accountApprovals: {
    title: 'Account Approvals | Onboard Student Leaders',
    description: 'Review and approve new AquaTerra member accounts. Build our student-led community.',
    image: '',
    path: '/director/approvals',
  },
  postModeration: {
    title: 'Post Moderation | Community Management',
    description: 'Review and moderate posts on the AquaTerra student community platform.',
    image: '',
    path: '/director/moderation',
  },
  memberDirectory: {
    title: 'Member Directory | Student Leaders',
    description: 'Browse and manage AquaTerra student leaders and community members.',
    image: '',
    path: '/director/members',
  },
  categoryManagement: {
    title: 'Category Management | Community Organization',
    description: 'Manage post categories and tags for student-led projects and community content.',
    image: '',
    path: '/director/categories',
  },
  notFound: {
    title: 'Page Not Found | AquaTerra',
    description: 'The page you\'re looking for doesn\'t exist.',
    image: '',
    path: '*',
  },
  // Paradox 2026 Pages
  paradoxHome: {
    title: 'Paradox 2026 | Student-Led Competitive Fest Kolkata',
    description: 'Paradox 2026 — AquaTerra\'s student-led competitive fest: sport, business, creative & cultural events across one week in Kolkata. Every rupee funds welfare projects.',
    image: '',
    path: '/paradox',
  },
  paradoxRegister: {
    title: 'Register for Paradox 2026 | Student-Led Competitive Fest',
    description: 'Register for Paradox 2026: AquaTerra\'s student-led competitive fest in Kolkata. Sport, business, creative & cultural events. Free to enter, proceeds to welfare.',
    image: '',
    path: '/paradox/register',
  },
  paradoxEvents: {
    title: 'Events | Paradox 2026 Student-Led Competitive Fest',
    description: 'Paradox 2026 events: sport, business, creative and cultural competitions at AquaTerra\'s student-led competitive fest in Kolkata.',
    image: '',
    path: '/paradox/events',
  },
  paradoxEventDetail: {
    title: '{eventName} | Paradox 2026',
    description: '{eventDescription}',
    image: '{eventImage}',
    path: '/paradox/events/:id',
  },
  paradoxBlog: {
    title: 'Blog | Paradox 2026 Student-Led Competitive Fest',
    description: 'Updates, recaps and behind-the-scenes from Paradox 2026, AquaTerra\'s student-led competitive fest in Kolkata.',
    image: '',
    path: '/paradox/blog',
  },
  paradoxBlogDetail: {
    title: '{blogTitle} | Paradox 2026 Blog',
    description: '{blogExcerpt}',
    image: '{blogImage}',
    path: '/paradox/blog/:id',
  },
  paradoxTeam: {
    title: 'Team | Meet Paradox 2026 Student Leaders',
    description: 'Meet the student-led team organising Paradox 2026, AquaTerra\'s competitive fest in Kolkata.',
    image: '',
    path: '/paradox/team',
  },
  paradoxSponsors: {
    title: 'Sponsors | Paradox 2026',
    description: 'Partners and sponsors supporting Paradox 2026, AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/sponsor',
  },
  paradoxTickets: {
    title: 'Get Tickets | Paradox 2026 Competitive Fest',
    description: 'Get your ticket for Paradox 2026, the student-led competitive fest in Kolkata.',
    image: '',
    path: '/paradox/ticket',
  },
  paradoxVolunteer: {
    title: 'Volunteer | Join Paradox 2026 Team',
    description: 'Become a volunteer for Paradox 2026 and help organise AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/volunteer',
  },
  paradoxWinners: {
    title: 'Winners | Paradox 2026 Competitions',
    description: 'Meet the winners of Paradox 2026 competitions at AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/winners',
  },
  paradoxScores: {
    title: 'Scores | Paradox 2026 Rankings',
    description: 'View competition scores and rankings from Paradox 2026, AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/scores',
  },
  paradoxUpdates: {
    title: 'Updates | Paradox 2026 News',
    description: 'Latest updates about Paradox 2026, AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/updates',
  },
  paradoxContact: {
    title: 'Contact | Paradox 2026 Team',
    description: 'Get in touch with the Paradox 2026 student leadership team. Questions about AquaTerra\'s student-led competitive fest.',
    image: '',
    path: '/paradox/contact',
  },
}

export const getMetaData = (pageKey: string): MetaConfig => {
  return pageMetadata[pageKey] || pageMetadata.home
}

export const DEFAULT_OG_IMAGE = ''
