# Database schema

Source of truth for the schema lives in `migrations/`, applied in filename
order. To apply against a project:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

or run the file's contents directly in the Supabase SQL editor.

See `migrations/0001_init.sql` for schema details, identity notes, and the
current (temporary, pre-auth) RLS policies.
