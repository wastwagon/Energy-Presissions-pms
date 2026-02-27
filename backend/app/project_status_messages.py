"""
Predefined project status update messages for professional milestone tracking.
Admins can select from these when updating project status.
"""
from app.models import ProjectStatus

# Status-specific predefined messages for milestone achievement
PROJECT_STATUS_MESSAGES = {
    ProjectStatus.NEW: [
        "Initial inquiry received and project created",
        "Site assessment scheduled",
        "Awaiting customer documents (ID, utility bill, site photos)",
        "Site visit completed – awaiting load analysis",
        "Load analysis in progress",
        "Customer requirements documented",
    ],
    ProjectStatus.QUOTED: [
        "Quote prepared and ready for review",
        "Quote sent to customer",
        "Awaiting customer response on quote",
        "Follow-up call scheduled with customer",
        "Quote revised per customer feedback",
        "Customer requested clarification – response sent",
    ],
    ProjectStatus.ACCEPTED: [
        "Customer accepted quote – contract signed",
        "Deposit received – project confirmed",
        "Materials ordered for installation",
        "Installation date scheduled",
        "Permits and approvals in progress",
        "Awaiting final payment before installation",
    ],
    ProjectStatus.REJECTED: [
        "Customer declined quote – budget constraints",
        "Customer chose alternative provider",
        "Project put on hold by customer",
        "Quote expired – no response from customer",
        "Site constraints – project not feasible",
    ],
    ProjectStatus.INSTALLED: [
        "Installation completed successfully",
        "System commissioned and tested",
        "Handover documentation provided to customer",
        "Warranty and maintenance info shared",
        "Post-installation inspection passed",
    ],
}


def get_messages_for_status(status: ProjectStatus) -> list[str]:
    """Return predefined messages for a given status."""
    return PROJECT_STATUS_MESSAGES.get(status, [])
