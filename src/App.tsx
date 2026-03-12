/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './components/auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgendaDashboard from './pages/AgendaDashboard';
import Patients from './pages/Patients';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import InstallPWA from './components/InstallPWA';
import { UserRole } from './types';

export default function App() {
  const [role, setRole] = useState<UserRole>('doctor');

  useEffect(() => {
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role) {
          setRole(profile.role as UserRole);
        }
      }
    });

    // Carga inicial
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role) {
          setRole(profile.role as UserRole);
        }
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <InstallPWA />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* Doctor Routes */}
        <Route 
          path="/admin" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <AdminDashboard role={role} />
            </Layout>
          } 
        />
        <Route 
          path="/admin/agenda" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <AgendaDashboard role={role} />
            </Layout>
          } 
        />

        {/* Shared Routes */}
        <Route 
          path="/patients" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <Patients />
            </Layout>
          } 
        />
        <Route 
          path="/history" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <History />
            </Layout>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <Settings />
            </Layout>
          } 
        />

        {/* Assistant Specific Routes */}
        <Route 
          path="/agenda" 
          element={
            <Layout role={role} onRoleChange={setRole}>
              <AgendaDashboard role={role} />
            </Layout>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
