# Copy admin and superadmin routes
$sourceAdmin = "C:\Users\Mounkaila\PhpstormProjects\Carpentry\app\admin"
$destAdmin = "C:\Users\Mounkaila\PhpstormProjects\Carpentry-front\src\app\[lang]\admin"

$sourceSuperAdmin = "C:\Users\Mounkaila\PhpstormProjects\Carpentry\app\superadmin"
$destSuperAdmin = "C:\Users\Mounkaila\PhpstormProjects\Carpentry-front\src\app\[lang]\superadmin"

# Copy admin
Write-Host "Copying admin routes..."
Copy-Item -Path "$sourceAdmin\*" -Destination $destAdmin -Recurse -Force

# Copy superadmin
Write-Host "Copying superadmin routes..."
Copy-Item -Path "$sourceSuperAdmin\*" -Destination $destSuperAdmin -Recurse -Force

Write-Host "Done!"
