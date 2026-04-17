import { useEffect, useMemo, useState } from 'react'
import {
  AddRounded,
  AutoStoriesRounded,
  DashboardRounded,
  DarkModeRounded,
  ExpandMoreRounded,
  FolderRounded,
  LightModeRounded,
  LogoutRounded,
  MenuRounded,
  RefreshRounded,
  SettingsRounded,
  WorkspacesRounded,
} from '@mui/icons-material'
import {
  Avatar,
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useColorMode } from '@/theme/colorMode'
import { notifySuccess } from '@/services/toastService'
import {
  ACTIVE_WORKSPACE_CHANGED_EVENT,
  fetchWorkspaces,
  getStoredActiveWorkspace,
  setStoredActiveWorkspace,
} from '@/services/workspaceService'
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
  const { mode, toggleMode } = useColorMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceUuid, setActiveWorkspaceUuid] = useState<string | null>(() => getStoredActiveWorkspace()?.uuid ?? null)
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [workspaceMenuAnchorEl, setWorkspaceMenuAnchorEl] = useState<HTMLElement | null>(null)
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const navigate = useNavigate()
  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.uuid === activeWorkspaceUuid) ?? null,
    [activeWorkspaceUuid, workspaces],
  )
  const avatarUrl = useMemo(() => {
    if (!user?.avatar) {
      return undefined
    }

    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
    return `${base.replace(/\/$/, '')}/storage/${user.avatar}`
  }, [user?.avatar])

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/boards')) return 'Boards'
    if (location.pathname.startsWith('/knowledgebase')) return 'Knowledgebase'
    if (location.pathname.startsWith('/workspaces')) return 'Workspaces'
    if (location.pathname.startsWith('/settings')) return 'Settings'
    if (location.pathname.startsWith('/tasks')) return 'Tasks'
    return 'Dashboard'
  }, [location.pathname])

  useEffect(() => {
    const handleWorkspaceChanged = () => {
      setActiveWorkspaceUuid(getStoredActiveWorkspace()?.uuid ?? null)
    }

    window.addEventListener(ACTIVE_WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged)
    return () => {
      window.removeEventListener(ACTIVE_WORKSPACE_CHANGED_EVENT, handleWorkspaceChanged)
    }
  }, [])

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

      <Box sx={{ flexGrow: 1 }} />

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
          <Button
            color="inherit"
            variant="outlined"
            size={isSmallScreen ? 'small' : 'medium'}
            startIcon={isSmallScreen ? undefined : <WorkspacesRounded />}
            endIcon={
              <ExpandMoreRounded
                sx={{
                  transform: workspaceMenuAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 120ms ease',
                }}
              />
            }
            aria-haspopup="menu"
            aria-expanded={Boolean(workspaceMenuAnchorEl)}
            onClick={(event) => setWorkspaceMenuAnchorEl(event.currentTarget)}
            sx={{
              mr: 1,
              minWidth: { xs: 0, sm: 220 },
              maxWidth: { xs: 138, sm: 320 },
              px: { xs: 1, sm: 1.5 },
              justifyContent: 'flex-start',
              borderColor: 'divider',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isSmallScreen
              ? (activeWorkspace?.name ?? 'Workspace')
              : (activeWorkspace?.name ?? (loadingWorkspaces ? 'Loading workspaces...' : 'Select workspace'))}
          </Button>
          <IconButton
            onClick={toggleMode}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{ mr: 0.5 }}
          >
            {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
          </IconButton>
          {user ? (
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Avatar src={avatarUrl} sx={{ width: 36, height: 36 }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Stack>
          ) : null}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={workspaceMenuAnchorEl}
        open={Boolean(workspaceMenuAnchorEl)}
        onClose={() => setWorkspaceMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setWorkspaceMenuAnchorEl(null)
            void handleRefreshWorkspaces()
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <RefreshRounded fontSize="small" />
            <span>Refresh</span>
          </Stack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setWorkspaceMenuAnchorEl(null)
            navigate('/workspaces/create')
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AddRounded fontSize="small" />
            <span>New workspace</span>
          </Stack>
        </MenuItem>
        <Divider />
        {workspaces.map((workspace) => (
          <MenuItem
            key={workspace.uuid}
            selected={workspace.uuid === activeWorkspaceUuid}
            onClick={() => {
              handleSelectWorkspace(workspace)
              setWorkspaceMenuAnchorEl(null)
            }}
          >
            {workspace.name}
          </MenuItem>
        ))}
      </Menu>

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
