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

    console.log('Checking if Fornalli admin exists...');

    // Check if Fornalli admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const fornalliAdmin = existingUsers?.users.find(u => u.email === 'admin@fornalli.com.br');

    if (fornalliAdmin) {
      console.log('Fornalli admin already exists:', fornalliAdmin.id);
      
      // Ensure Fornalli admin has admin role
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', fornalliAdmin.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        console.log('Adding admin role to existing Fornalli user...');
        await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: fornalliAdmin.id, role: 'admin' });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin Fornalli já existe',
          user_id: fornalliAdmin.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Fornalli admin user...');

    // Create Fornalli admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@fornalli.com.br',
      password: 'fornalli@2025',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Fornalli'
      }
    });

    if (createError) {
      console.error('Error creating Fornalli admin:', createError);
      throw createError;
    }

    console.log('Fornalli admin created:', newUser.user.id);

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: newUser.user.id, 
        role: 'admin' 
      });

    if (roleError && roleError.code !== '23505') {
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
        full_name: 'Administrador Fornalli'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin Fornalli criado com sucesso',
        user_id: newUser.user.id,
        credentials: {
          email: 'admin@fornalli.com.br',
          password: 'fornalli@2025'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-fornalli-admin function:', error);
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
