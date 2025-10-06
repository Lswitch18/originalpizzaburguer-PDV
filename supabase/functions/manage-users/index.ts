import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  is_admin: boolean;
}

interface UpdateUserRoleRequest {
  user_id: string;
  is_admin: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { method } = req;

    // GET - List all users with their roles
    if (method === 'GET') {
      const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error listing users:', usersError);
        return new Response(
          JSON.stringify({ error: 'Failed to list users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get roles for all users
      const { data: userRoles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      const usersWithRoles = users.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_admin: userRoles?.some(r => r.user_id === u.id && r.role === 'admin') || false
      }));

      return new Response(
        JSON.stringify({ users: usersWithRoles }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create new user
    if (method === 'POST') {
      const body: CreateUserRequest = await req.json();
      const { email, password, full_name, is_admin } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Creating user:', email);

      // Create user using admin API
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || '' }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User created:', newUser.user.id);

      // Create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: newUser.user.id,
          full_name: full_name || ''
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Add admin role if requested
      if (is_admin) {
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Error adding admin role:', roleError);
        } else {
          console.log('Admin role added for user:', newUser.user.id);
        }
      }

      return new Response(
        JSON.stringify({ 
          user: {
            id: newUser.user.id,
            email: newUser.user.email,
            is_admin
          }
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH - Update user role
    if (method === 'PATCH') {
      const body: UpdateUserRoleRequest = await req.json();
      const { user_id, is_admin } = body;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Updating role for user:', user_id, 'is_admin:', is_admin);

      if (is_admin) {
        // Add admin role
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id,
            role: 'admin'
          })
          .select();

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error('Error adding admin role:', roleError);
          return new Response(
            JSON.stringify({ error: roleError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Remove admin role
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)
          .eq('role', 'admin');

        if (roleError) {
          console.error('Error removing admin role:', roleError);
          return new Response(
            JSON.stringify({ error: roleError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
