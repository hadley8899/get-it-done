import { useEffect, useMemo, useState } from 'react'
import {
  AddRounded,
  AutoStoriesRounded,
  DashboardRounded,
  FolderRounded,
  LogoutRounded,
  MenuRounded,
  RefreshRounded,
  SettingsRounded,
  WorkspacesRounded,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { notifySuccess } from '@/services/toastService'
import { fetchWorkspaces, getStoredActiveWorkspace, setStoredActiveWorkspace } from '@/services/workspaceService'
import type { Workspace } from '@/types/workspace'

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardRounded /> },
  { label: 'Boards', to: '/boards', icon: <FolderRounded /> },
  { label: 'Knowledgebases', to: '/knowledgebase', icon: <AutoStoriesRounded /> },
  { label: 'Workspaces', to: '/workspaces', icon: <WorkspacesRounded /> },
  { label: 'Settings', to: '/settings', icon: <SettingsRounded /> },
]

const drawerWidth = 290

export function AppShell() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceUuid, setActiveWorkspaceUuid] = useState<string | null>(() => getStoredActiveWorkspace()?.uuid ?? null)
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const location = useLocation()
  const navigate = useNavigate()

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/boards')) return 'Boards'
    if (location.pathname.startsWith('/knowledgebase')) return 'Knowledgebase'
    if (location.pathname.startsWith('/workspaces')) return 'Workspaces'
    if (location.pathname.startsWith('/settings')) return 'Settings'
    if (location.pathname.startsWith('/tasks')) return 'Tasks'
    return 'Dashboard'
  }, [location.pathname])

  useEffect(() => {
    let isMounted = true

    async function loadWorkspaces() {
      try {
        const nextWorkspaces = await fetchWorkspaces()

        if (!isMounted) {
          return
        }

        setWorkspaces(nextWorkspaces)

        const storedActive = getStoredActiveWorkspace()
        if (storedActive && nextWorkspaces.some((workspace) => workspace.uuid === storedActive.uuid)) {
          setActiveWorkspaceUuid(storedActive.uuid)
        } else {
          setActiveWorkspaceUuid(null)
          setStoredActiveWorkspace(null)
        }
      } finally {
        if (isMounted) {
          setLoadingWorkspaces(false)
        }
      }
    }

    void loadWorkspaces()

    return () => {
      isMounted = false
    }
  }, [location.pathname])

  const handleRefreshWorkspaces = () => {
    setLoadingWorkspaces(true)
    void fetchWorkspaces()
      .then((nextWorkspaces) => {
        setWorkspaces(nextWorkspaces)
      })
      .finally(() => {
        setLoadingWorkspaces(false)
      })
  }

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceUuid(workspace.uuid)
    setStoredActiveWorkspace(workspace)
    notifySuccess('Workspace selected successfully.')
    navigate('/boards')

    if (!isDesktop) {
      setMobileOpen(false)
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', px: 2, py: 3 }}>
      <Stack spacing={0.5} sx={{ px: 1.5, pb: 3 }}>
        <Typography variant="overline" sx={{ letterSpacing: 4, color: 'text.secondary' }}>
          GET IT DONE
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Workspace
        </Typography>
      </Stack>

      <List sx={{ display: 'grid', gap: 1 }}>
        {navigationItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

          return (
            <ListItemButton
              key={item.label}
              component={NavLink}
              to={item.to}
              onClick={() => {
                if (!isDesktop) {
                  setMobileOpen(false)
                }
              }}
              sx={{
                borderRadius: 3,
                ...(active
                  ? {
                      backgroundColor: (themeValue) => themeValue.palette.action.selected,
                    }
                  : {}),
              }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.5, pb: 1.5 }}>
        <Typography variant="overline" color="text.secondary">
          Workspaces
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={handleRefreshWorkspaces}>
            <RefreshRounded fontSize="small" />
          </IconButton>
          <IconButton size="small" component={NavLink} to="/workspaces/create">
            <AddRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 0.5 }}>
        {loadingWorkspaces ? (
          <Stack sx={{ py: 3, alignItems: 'center' }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <List sx={{ display: 'grid', gap: 0.5 }}>
            {workspaces.map((workspace) => (
              <ListItemButton
                key={workspace.uuid}
                onClick={() => handleSelectWorkspace(workspace)}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: workspace.uuid === activeWorkspaceUuid ? 'rgba(45, 143, 95, 0.12)' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <WorkspacesRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={workspace.name}
                  secondary={workspace.uuid === activeWorkspaceUuid ? 'Active workspace' : undefined}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={0.25} sx={{ px: 1.5, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2">{user?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
      </Stack>

      <Button component={NavLink} to="/user/logout" color="error" startIcon={<LogoutRounded />} sx={{ justifyContent: 'flex-start', borderRadius: 3 }}>
        Log out
      </Button>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          backgroundColor: (themeValue) => themeValue.palette.background.paper,
          borderBottom: (themeValue) => `1px solid ${themeValue.palette.divider}`,
          borderRadius: 0,
          px: { xs: 1, lg: 3 },
          zIndex: (themeValue) => themeValue.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          {!isDesktop ? (
            <IconButton onClick={() => setMobileOpen((prev) => !prev)} size="large">
              <MenuRounded />
            </IconButton>
          ) : null}
          <Stack spacing={0.25} sx={{ ml: isDesktop ? 0 : 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
              GET IT DONE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {pageTitle}
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {user ? (
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  color: 'common.white',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Box>
            </Stack>
          ) : null}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              borderRight: (themeValue) => `1px solid ${themeValue.palette.divider}`,
              borderRadius: 0,
              backgroundColor: (themeValue) => themeValue.palette.background.paper,
            },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />
        <Box sx={{ mt: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
