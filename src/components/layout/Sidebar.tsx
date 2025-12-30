"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutGrid, Settings, List, Briefcase, Clock, ChevronDown, Plus, LogOut, Layout, UserPlus } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { JiraLogo } from "@/components/ui/jira-logo"
import { usePathname } from "next/navigation"
import { workspaceApi } from "@/features/workspace/api/workspace-api";
import type { OrganizationResponse, ProjectResponse, BoardResponse } from "@/features/workspace/api/workspace-api";
import { CreateProjectModal } from "@/components/workspace/CreateProjectModal"
import { InviteUserModal } from "@/components/workspace/InviteUserModal"
import { Issue } from "@/types"

import { useProject, DEFAULT_COLUMNS } from "@/context/ProjectContext"

interface FullHierarchy extends OrganizationResponse {
    projects: (ProjectResponse & { board?: BoardResponse | null })[];
}

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { setCurrentProject, setCurrentBoard, setCurrentOrg, setIssues, setColumns, setIsCreateModalOpen, currentProject } = useProject()
    const [hierarchy, setHierarchy] = React.useState<FullHierarchy[]>([])
    const [loading, setLoading] = React.useState(true)
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = React.useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
    const [inviteOrg, setInviteOrg] = React.useState<{ id: string, name: string } | null>(null)

    React.useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                setLoading(true);
                // 1. Get Orgs
                const orgs = await workspaceApi.getOrganizations();

                // 2. Build Hierarchy
                const fullHierarchy: FullHierarchy[] = await Promise.all(
                    orgs.map(async (org: any) => {
                        const orgId = org.id || org.uuid || org.uuidValue || org.organizationId;
                        if (!orgId) return { ...org, projects: [] };

                        // Get Projects for this Org
                        const projects = await workspaceApi.getProjectsByOrg(orgId);

                        // Get Boards for each Project (Safe Fetch)
                        const projectsWithBoards = await Promise.all(
                            projects.map(async (project: any) => {
                                const projectId = project.id || project.uuid || project.projectId;
                                if (!projectId) return project;

                                let board = null;
                                let issues: Issue[] = [];
                                try {
                                    // Always fetch issues for the project
                                    issues = await workspaceApi.getIssuesByProject(projectId);

                                    // Try to fetch board (safe fetch)
                                    board = await workspaceApi.getBoardByProject(projectId);
                                } catch (e) {
                                    console.warn(`[Sidebar] Safe fetch failed for ${projectId}`, e);
                                }

                                return { ...project, board: board ? { ...board, issues } : null, issues };
                            })
                        );
                        return { ...org, projects: projectsWithBoards };
                    })
                );

                setHierarchy(fullHierarchy);

                // 3. Auto-select based on URL
                const projectKeyMatch = pathname.match(/\/project\/([^\/]+)/);
                if (projectKeyMatch) {
                    const key = projectKeyMatch[1];
                    for (const org of fullHierarchy) {
                        const project = org.projects.find(p => p.projectKey === key);
                        if (project) {
                            const { projects, ...projInfo } = project as any;
                            setCurrentProject(projInfo);
                            setCurrentOrg({ id: org.id, name: org.name });

                            if (project.board) {
                                setCurrentBoard(project.board);
                                setIssues(project.board.issues || []);
                                setColumns(project.board.columns && project.board.columns.length > 0 ? project.board.columns : DEFAULT_COLUMNS);
                            } else {
                                // Fallback if no board
                                setCurrentBoard(null);
                                setIssues((project as any).issues || []);
                                setColumns(DEFAULT_COLUMNS);
                            }
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("Hierarchy fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [pathname]);

    return (
        <div className={cn("flex flex-col h-screen w-64 bg-[#FAFBFC] border-r border-[var(--border)] fixed left-0 top-0 z-30", className)}>
            {/* Project Header */}
            <div className="p-4 flex items-center gap-3 mb-2 px-5 pt-6">
                <div className="flex items-center justify-center w-8 h-8">
                    <JiraLogo className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="font-semibold text-sm text-[var(--foreground)] leading-tight">Jira Clone</h1>
                    <p className="text-xs text-[var(--muted-foreground)]">Software project</p>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-4">
                <div>
                    <div className="space-y-1">
                        <NavItem href="#" icon={<span className="text-blue-600">★</span>} label="For you" />
                        <NavItem href="#" icon={<LayoutGrid size={16} />} label="Overview" />
                    </div>
                </div>

                <div className="border-t border-gray-200 mx-2" />

                {/* Create Section */}
                <div className="px-3">
                    <button
                        className="flex items-center gap-3 w-full px-2 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!currentProject}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <div className="flex items-center justify-center bg-[#0052cc] text-white w-4 h-4 rounded-[2px] group-hover:bg-[#0065ff]">
                            <Plus size={12} strokeWidth={3} />
                        </div>
                        <span className="truncate">Create issue</span>
                    </button>
                </div>

                {/* Spaces Section */}
                <div>
                    <div className="px-2 mb-2 flex items-center justify-between group cursor-pointer">
                        <span className="text-xs font-bold text-[#626F86] uppercase tracking-wide">Spaces</span>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus
                                size={14}
                                className="text-[#626F86] hover:text-[#0052cc]"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCreateProjectModalOpen(true);
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        {loading ? (
                            <div className="px-3 py-2 space-y-2">
                                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
                            </div>
                        ) : hierarchy.length > 0 ? (
                            hierarchy.map(org => (
                                <div key={org.id} className="space-y-1">
                                    <div className="px-2 py-1 text-[11px] font-bold text-[#626F86] flex items-center justify-between group/org">
                                        <span className="truncate">{org.name}</span>
                                        <UserPlus
                                            size={12}
                                            className="opacity-0 group-hover/org:opacity-100 hover:text-[#0052cc] cursor-pointer transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Specific ID requested by USER: 7ef1dab2-e0c7-4d73-8aad-d9f469044eda
                                                setInviteOrg({ id: "7ef1dab2-e0c7-4d73-8aad-d9f469044eda", name: org.name });
                                                setIsInviteModalOpen(true);
                                            }}
                                        />
                                    </div>
                                    {org.projects.map(project => (
                                        <div key={project.id} className="ml-1">
                                            {/* Render Item even if no board, use default or project info */}
                                            <NavItem
                                                href={`/project/${project.projectKey}/board`}
                                                icon={
                                                    project.board ? (
                                                        <div className={cn("w-4 h-4 rounded-[2px]",
                                                            project.board.type === "SCRUM" ? "bg-blue-500" : "bg-[#FF5630]"
                                                        )} />
                                                    ) : (
                                                        <Layout size={16} className="text-gray-400" />
                                                    )
                                                }
                                                label={project.board ? project.board.name : project.name}
                                                active={pathname?.includes(project.projectKey)}
                                                onClick={() => {
                                                    const { projects, ...projInfo } = project as any;
                                                    setCurrentProject(projInfo);
                                                    setCurrentOrg({ id: org.id, name: org.name });

                                                    if (project.board) {
                                                        setCurrentBoard(project.board);
                                                        setIssues(project.board.issues || []);
                                                        setColumns(project.board.columns && project.board.columns.length > 0 ? project.board.columns : DEFAULT_COLUMNS);
                                                    } else {
                                                        setCurrentBoard(null);
                                                        setIssues((project as any).issues || []);
                                                        setColumns(DEFAULT_COLUMNS);
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-xs text-[#626F86] italic">
                                No spaces found
                            </div>
                        )}
                    </div>

                    <div className="mt-2 px-2 text-xs font-medium text-[#626F86] hover:text-[#0052cc] cursor-pointer flex items-center gap-1">
                        <ChevronDown size={14} />
                        <span>More spaces</span>
                    </div>
                </div>

                {/* Recent Section - to be populated dynamically */}
                <div />
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3 px-2 cursor-pointer hover:text-[#0052cc] transition-colors">
                    <Settings size={16} />
                    <span>Project settings</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/sign-up" })}
                    className="flex w-full items-center gap-3 px-2 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
                >
                    <LogOut size={16} />
                    <span>Log out</span>
                </button>
            </div>

            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
            />

            {inviteOrg && (
                <InviteUserModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    orgId={inviteOrg.id}
                    orgName={inviteOrg.name}
                />
            )}
        </div >
    )
}

function NavItem({ href, icon, label, active, small, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; small?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-[3px] transition-colors",
                active
                    ? "bg-[#E9F2FF] text-[#0052CC]"
                    : "text-[#172B4D] hover:bg-[#EBECF0]",
                small && "py-1.5 text-[13px]"
            )}
        >
            <div className={cn("flex items-center justify-center", active ? "text-[#0052CC]" : "text-[#42526E]")}>
                {icon}
            </div>
            <span className="truncate">{label}</span>
        </Link>
    )
}
