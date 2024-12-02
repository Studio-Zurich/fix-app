CREATE TABLE incident_types (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
description TEXT,
active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE incident_subtypes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
incident_type_id UUID REFERENCES incident_types(id),
name TEXT NOT NULL,
description TEXT,
active BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reports (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
incident_type_id UUID REFERENCES incident_types(id),
incident_subtype_id UUID REFERENCES incident_subtypes(id),
status TEXT NOT NULL DEFAULT 'draft',
title TEXT,
description TEXT,
location_lat DECIMAL,
location_lng DECIMAL,
location_address TEXT,
reporter_name TEXT,
reporter_email TEXT,
reporter_phone TEXT,
metadata JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_images (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
storage_path TEXT NOT NULL,
file_name TEXT,
file_type TEXT,
file_size INTEGER,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE report_history (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
user_id UUID REFERENCES auth.users(id),
action TEXT NOT NULL,
details JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a public bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true);
