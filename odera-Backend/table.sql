-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Contracts (
  ContractID uuid NOT NULL DEFAULT gen_random_uuid(),
  JobID uuid NOT NULL DEFAULT gen_random_uuid(),
  EmployerID uuid NOT NULL DEFAULT gen_random_uuid(),
  FreelancerID uuid DEFAULT gen_random_uuid(),
  ApplicationID uuid DEFAULT gen_random_uuid(),
  StartDate timestamp with time zone,
  EndDate timestamp with time zone,
  Status character varying NOT NULL,
  Terms character varying NOT NULL,
  PricingMin real NOT NULL DEFAULT '0'::real,
  PricingMax real DEFAULT '0'::real,
  Proposals bigint DEFAULT '0'::bigint,
  Progress bigint DEFAULT '0'::bigint,
  LastUpdate timestamp with time zone,
  BudgetSpent double precision DEFAULT '0'::double precision,
  CONSTRAINT Contracts_pkey PRIMARY KEY (ContractID),
  CONSTRAINT Contracts_JobID_fkey FOREIGN KEY (JobID) REFERENCES public.Jobs(JobID),
  CONSTRAINT Contracts_EmployerID_fkey FOREIGN KEY (EmployerID) REFERENCES public.Employers(EmployerID),
  CONSTRAINT Contracts_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES public.Freelancers(FreelancerID),
  CONSTRAINT Contracts_ApplicationID_fkey FOREIGN KEY (ApplicationID) REFERENCES public.JobApplications(ApplicationID)
);
CREATE TABLE public.EmployerProfiles (
  EmployerProfileID uuid NOT NULL DEFAULT gen_random_uuid(),
  EmployerID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserBio character varying,
  ProfilePic character varying NOT NULL DEFAULT 'default.png'::character varying,
  Organization character varying NOT NULL,
  MailingList boolean NOT NULL DEFAULT false,
  AccountUpdated timestamp with time zone NOT NULL DEFAULT now(),
  TotalProjects bigint DEFAULT '0'::bigint,
  ActiveProjects bigint DEFAULT '0'::bigint,
  CompletedProjects bigint DEFAULT '0'::bigint,
  TotalSpent bigint DEFAULT '0'::bigint,
  AvgProjectCost bigint DEFAULT '0'::bigint,
  SuccessRate bigint DEFAULT '0'::bigint,
  CONSTRAINT EmployerProfiles_pkey PRIMARY KEY (EmployerProfileID),
  CONSTRAINT EmployerReviews_EmployerID_fkey FOREIGN KEY (EmployerID) REFERENCES public.Employers(EmployerID)
);
CREATE TABLE public.EmployerReviews (
  EmployerReviewsID uuid NOT NULL DEFAULT gen_random_uuid(),
  WriterID uuid NOT NULL DEFAULT gen_random_uuid(),
  RevieweeID uuid NOT NULL DEFAULT gen_random_uuid(),
  StarRating real NOT NULL DEFAULT '0'::real,
  Content character varying,
  CONSTRAINT EmployerReviews_pkey PRIMARY KEY (EmployerReviewsID),
  CONSTRAINT EmployerReviews_RevieweeID_fkey FOREIGN KEY (RevieweeID) REFERENCES public.EmployerProfiles(EmployerProfileID),
  CONSTRAINT EmployerReviews_WriterID_fkey FOREIGN KEY (WriterID) REFERENCES public.FreelancerProfile(FreelancerProfileID)
);
CREATE TABLE public.Employers (
  EmployerID uuid NOT NULL DEFAULT gen_random_uuid(),
  FirstName character varying NOT NULL,
  LastName character varying NOT NULL,
  Email character varying NOT NULL,
  PhoneNumber character varying,
  Address character varying,
  AccountCreated timestamp with time zone NOT NULL DEFAULT now(),
  CompanyName character varying,
  CONSTRAINT Employers_pkey PRIMARY KEY (EmployerID),
  CONSTRAINT Employers_EmployerID_fkey FOREIGN KEY (EmployerID) REFERENCES auth.users(id)
);
CREATE TABLE public.FreelancerProfile (
  FreelancerProfileID uuid NOT NULL DEFAULT gen_random_uuid(),
  FreelancerID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserBio character varying,
  ProfilePic character varying DEFAULT 'default.jpg'::character varying,
  Organization character varying NOT NULL,
  MailingList boolean NOT NULL DEFAULT false,
  AccountUpdated timestamp with time zone DEFAULT now(),
  ProfileCompletion bigint DEFAULT '0'::bigint,
  TotalEarnings bigint DEFAULT '0'::bigint,
  ActiveProjects bigint DEFAULT '0'::bigint,
  CompletedProjects bigint DEFAULT '0'::bigint,
  ResponseTime character varying DEFAULT 'Unknown'::character varying,
  Availability character varying DEFAULT 'Unavailable'::character varying,
  HourlyRate bigint DEFAULT '0'::bigint,
  Specialty character varying,
  School character varying,
  Year character varying DEFAULT 'Freshman'::character varying,
  LastActive timestamp with time zone DEFAULT now(),
  SuccessRate bigint DEFAULT '0'::bigint,
  Rating double precision DEFAULT '0'::double precision,
  FreelancerSkillID uuid,
  CONSTRAINT FreelancerProfile_pkey PRIMARY KEY (FreelancerProfileID),
  CONSTRAINT FreelancerProfile_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES public.Freelancers(FreelancerID),
  CONSTRAINT FreelancerProfile_FreelancerSkillID_fkey FOREIGN KEY (FreelancerSkillID) REFERENCES public.FreelancerSkills(FreelancerSkillID)
);
CREATE TABLE public.FreelancerReviews (
  FreelancerReviewID uuid NOT NULL DEFAULT gen_random_uuid(),
  RevieweeID uuid NOT NULL DEFAULT gen_random_uuid(),
  WriterID uuid NOT NULL DEFAULT gen_random_uuid(),
  StarRating double precision NOT NULL,
  Content character varying,
  CONSTRAINT FreelancerReviews_pkey PRIMARY KEY (FreelancerReviewID),
  CONSTRAINT FreelancerReviews_WriterID_fkey FOREIGN KEY (WriterID) REFERENCES public.EmployerProfiles(EmployerProfileID),
  CONSTRAINT FreelancerReviews_RevieweeID_fkey FOREIGN KEY (RevieweeID) REFERENCES public.FreelancerProfile(FreelancerProfileID)
);
CREATE TABLE public.FreelancerSkills (
  FreelancerSkillID uuid NOT NULL DEFAULT gen_random_uuid(),
  FreelancerID uuid NOT NULL DEFAULT gen_random_uuid(),
  Skill character varying NOT NULL,
  CONSTRAINT FreelancerSkills_pkey PRIMARY KEY (FreelancerSkillID),
  CONSTRAINT FreelancerSkills_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES public.Freelancers(FreelancerID)
);
CREATE TABLE public.Freelancers (
  FreelancerID uuid NOT NULL DEFAULT gen_random_uuid(),
  FirstName character varying NOT NULL,
  LastName character varying NOT NULL,
  Email character varying NOT NULL,
  PhoneNumber character varying,
  Address character varying,
  AccountCreated time with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Freelancers_pkey PRIMARY KEY (FreelancerID),
  CONSTRAINT Freelancers_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES auth.users(id)
);
CREATE TABLE public.JobApplications (
  ApplicationID uuid NOT NULL DEFAULT gen_random_uuid(),
  JobID uuid NOT NULL DEFAULT gen_random_uuid(),
  FreelancerID uuid NOT NULL DEFAULT gen_random_uuid(),
  ResumeFile character varying DEFAULT ''::character varying,
  ProposalText character varying NOT NULL,
  Status character varying,
  Experience character varying,
  Timeline character varying,
  Rating double precision,
  CoverLetter character varying,
  FreelancerSkillID uuid,
  CONSTRAINT JobApplications_pkey PRIMARY KEY (ApplicationID),
  CONSTRAINT JobApplications_JobID_fkey FOREIGN KEY (JobID) REFERENCES public.Jobs(JobID),
  CONSTRAINT JobApplications_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES public.Freelancers(FreelancerID),
  CONSTRAINT JobApplications_FreelancerSkillID_fkey FOREIGN KEY (FreelancerSkillID) REFERENCES public.FreelancerSkills(FreelancerSkillID)
);
CREATE TABLE public.JobSkills (
  JobSkillID uuid NOT NULL DEFAULT gen_random_uuid(),
  JobID uuid NOT NULL DEFAULT gen_random_uuid(),
  Skill character varying NOT NULL DEFAULT 'Unknown'::character varying,
  CONSTRAINT JobSkills_pkey PRIMARY KEY (JobSkillID),
  CONSTRAINT JobSkills_JobID_fkey FOREIGN KEY (JobID) REFERENCES public.Jobs(JobID)
);
CREATE TABLE public.Jobs (
  JobID uuid NOT NULL DEFAULT gen_random_uuid(),
  FreelancerID uuid,
  EmployerID uuid NOT NULL DEFAULT gen_random_uuid(),
  JobTitle character varying NOT NULL,
  JobDesc character varying NOT NULL,
  JobCat character varying NOT NULL,
  JobPrice real NOT NULL,
  JobCreated timestamp with time zone NOT NULL DEFAULT now(),
  BudgetMin double precision DEFAULT '0'::double precision,
  BudgetMax double precision DEFAULT '0'::double precision,
  Duration character varying,
  Urgency character varying,
  CONSTRAINT Jobs_pkey PRIMARY KEY (JobID),
  CONSTRAINT Jobs_EmployerID_fkey FOREIGN KEY (EmployerID) REFERENCES public.Employers(EmployerID),
  CONSTRAINT Jobs_FreelancerID_fkey FOREIGN KEY (FreelancerID) REFERENCES public.Freelancers(FreelancerID)
);
CREATE TABLE public.Messages (
  messageid uuid NOT NULL DEFAULT gen_random_uuid(),
  senderid uuid NOT NULL,
  receiverid uuid NOT NULL,
  projectid uuid,
  content character varying NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  isunread boolean DEFAULT true,
  type character varying DEFAULT 'message'::character varying,
  CONSTRAINT Messages_pkey PRIMARY KEY (messageid),
  CONSTRAINT Messages_senderid_fkey FOREIGN KEY (senderid) REFERENCES auth.users(id),
  CONSTRAINT Messages_receiverid_fkey FOREIGN KEY (receiverid) REFERENCES auth.users(id)
);
CREATE TABLE public.Payments (
  PaymentID uuid NOT NULL DEFAULT gen_random_uuid(),
  JobID uuid NOT NULL DEFAULT gen_random_uuid(),
  PayerID uuid NOT NULL DEFAULT gen_random_uuid(),
  PayeeID uuid NOT NULL DEFAULT gen_random_uuid(),
  PaymentTimestamp timestamp with time zone NOT NULL DEFAULT now(),
  AmountPaid real NOT NULL DEFAULT '0'::real,
  Currency character varying NOT NULL DEFAULT 'USD'::character varying,
  TransactionID uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT Payments_pkey PRIMARY KEY (PaymentID),
  CONSTRAINT Payments_JobID_fkey FOREIGN KEY (JobID) REFERENCES public.Jobs(JobID),
  CONSTRAINT Payments_PayerID_fkey FOREIGN KEY (PayerID) REFERENCES public.Employers(EmployerID),
  CONSTRAINT Payments_PayeeID_fkey FOREIGN KEY (PayeeID) REFERENCES public.Freelancers(FreelancerID)
);
CREATE TABLE public.ProjectMilestones (
  MilestoneID bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Title character varying,
  Description character varying,
  IsComplete boolean DEFAULT false,
  ContractID uuid NOT NULL,
  CONSTRAINT ProjectMilestones_pkey PRIMARY KEY (MilestoneID),
  CONSTRAINT ProjectMilestones_ContractID_fkey FOREIGN KEY (ContractID) REFERENCES public.Contracts(ContractID)
);