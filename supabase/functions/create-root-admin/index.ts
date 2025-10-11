import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Checking if root admin exists...');

    // Check if root admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const rootAdmin = existingUsers?.users.find(u => u.email === 'admin@root.com');

    if (rootAdmin) {
      console.log('Root admin already exists:', rootAdmin.id);
      
      // Ensure root admin has admin role
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', rootAdmin.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        console.log('Adding admin role to existing root user...');
        await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: rootAdmin.id, role: 'admin' });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Root admin já existe',
          user_id: rootAdmin.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating root admin user...');

    // Create root admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@root.com',
      password: 'admin',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Root'
      }
    });

    if (createError) {
      console.error('Error creating root admin:', createError);
      throw createError;
    }

    console.log('Root admin created:', newUser.user.id);

    // Add admin role (ignore if already exists)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: newUser.user.id, 
        role: 'admin' 
      });

    if (roleError && roleError.code !== '23505') {
      // Only throw if it's not a duplicate key error
      console.error('Error adding admin role:', roleError);
      throw roleError;
    }
    
    if (roleError?.code === '23505') {
      console.log('Admin role already exists for this user');
    }

    console.log('Admin role added successfully');

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        full_name: 'Administrador Root'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't throw, profile might already exist from trigger
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Root admin criado com sucesso',
        user_id: newUser.user.id,
        credentials: {
          email: 'admin@root.com',
          password: 'admin'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-root-admin function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
