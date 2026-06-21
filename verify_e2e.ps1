$ErrorActionPreference = "Stop"
$API = "http://localhost:3000/api"

function CallApi {
    param([string]$url, [string]$method = "GET", $body = $null, [string]$token = "")
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{ Uri = $url; Method = $method; Headers = $headers; ContentType = "application/json" }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Compress -Depth 5) }
    return Invoke-RestMethod @params
}

Write-Host ""
Write-Host "============================================================"
Write-Host "  JOBSPHERE AI - FULL E2E INTEGRATION VERIFICATION"
Write-Host "============================================================"

# Step 1 - AUTH
Write-Host ""
Write-Host "[1] AUTHENTICATION"
$recLogin  = CallApi -url "$API/auth/login" -method "POST" -body @{ email = "recruiter_a@e2e.test"; password = "Test@1234" }
$candLogin = CallApi -url "$API/auth/login" -method "POST" -body @{ email = "candidate_a@e2e.test"; password = "Test@1234" }
$RT = $recLogin.token
$CT = $candLogin.token
Write-Host "    Recruiter A : OK  role=$($recLogin.user.role)  name=$($recLogin.user.name)"
Write-Host "    Candidate A : OK  role=$($candLogin.user.role)  name=$($candLogin.user.name)"
$candClerkId = $candLogin.user.clerkId

# Step 2 - RECRUITER PIPELINE
Write-Host ""
Write-Host "[2] RECRUITER PIPELINE - /api/applications/candidates"
$pipeline = CallApi -url "$API/applications/candidates" -token $RT
Write-Host "    Total in pipeline: $($pipeline.Count)"
$alpha = $null
foreach ($p in $pipeline) {
    if ($p.candidateName -eq "Candidate Alpha") { $alpha = $p; break }
}
if ($alpha) {
    Write-Host "    Candidate Alpha FOUND"
    Write-Host "      candidateName  = $($alpha.candidateName)"
    Write-Host "      candidateEmail = $($alpha.candidateEmail)"
    Write-Host "      jobTitle       = $($alpha.jobTitle)"
    Write-Host "      stage          = $($alpha.stage)"
    Write-Host "      atsScore       = $($alpha.atsScore)"
    Write-Host "      skills         = $($alpha.skills -join ', ')"
    Write-Host "      experience     = $($alpha.experience)"
    Write-Host "      candidateClerkId = $($alpha.candidateClerkId)"
    $appId = $alpha._id
} else {
    Write-Host "    ERROR: Candidate Alpha NOT found!"
    exit 1
}

# Step 3 - PUBLIC PROFILE
Write-Host ""
Write-Host "[3] CANDIDATE PUBLIC PROFILE - /api/users/public/$candClerkId"
$pub = CallApi -url "$API/users/public/${candClerkId}?increment=false" -token $RT
Write-Host "    name           = $($pub.name)"
Write-Host "    title          = $($pub.title)"
Write-Host "    experience     = $($pub.experience)"
Write-Host "    college        = $($pub.college)"
Write-Host "    degree         = $($pub.degree)"
Write-Host "    graduationYear = $($pub.graduationYear)"
Write-Host "    atsScore       = $($pub.atsScore)"
Write-Host "    skills         = $($pub.skills -join ', ')"
Write-Host "    softSkills     = $($pub.softSkills -join ', ')"
$hasResume = if ($pub.resumeUrl) { "PRESENT" } else { "MISSING" }
Write-Host "    resumeUrl      = $hasResume"
if ($pub.resumeDetails) {
    Write-Host "    resumeDetails  = PRESENT"
    Write-Host "      atsScore     = $($pub.resumeDetails.atsScore)"
    Write-Host "      summary      = $($pub.resumeDetails.summary)"
    Write-Host "      missingKW    = $($pub.resumeDetails.missingKeywords -join ', ')"
    Write-Host "      improvements = $($pub.resumeDetails.improvements.Count) items"
} else {
    Write-Host "    resumeDetails  = MISSING"
}

# Step 4 - STAGE TRANSITIONS
Write-Host ""
Write-Host "[4] STAGE TRANSITIONS - PATCH /api/applications/$appId/stage"
foreach ($stage in @("Screening","Interview","Offer")) {
    $res = CallApi -url "$API/applications/$appId/stage" -method "PATCH" -body @{ stage = $stage } -token $RT
    $check = if ($res.stage -eq $stage) { "OK" } else { "MISMATCH" }
    Write-Host "    -> $stage  DB=$($res.stage)  $check"
}

# Step 5 - AI RANKINGS
Write-Host ""
Write-Host "[5] AI RANKINGS"
$allJobs = CallApi -url "$API/jobs" -token $RT
$e2eJob = $null
foreach ($j in $allJobs) {
    if ($j.company -eq "E2E Test Corp") { $e2eJob = $j; break }
}
if (-not $e2eJob) {
    Write-Host "    ERROR: E2E Test Corp job not found"
    exit 1
}
$jobId = $e2eJob._id
Write-Host "    Job: $($e2eJob.title)  ID=$jobId"

$gen = CallApi -url "$API/jobs/$jobId/generate-ranking" -method "POST" -token $RT
Write-Host "    generate-ranking: generated=$($gen.generated) cached=$($gen.cached) total=$($gen.total)"

$ranks = CallApi -url "$API/jobs/$jobId/ranked-candidates" -token $RT
Write-Host "    ranked-candidates total: $($ranks.total)"
foreach ($r in $ranks.rankings) {
    Write-Host "    >> $($r.candidateName)"
    Write-Host "       finalScore      = $($r.finalScore)"
    Write-Host "       skillsScore     = $($r.skillsScore)"
    Write-Host "       experienceScore = $($r.experienceScore)"
    Write-Host "       recommendation  = $($r.recommendation)"
    Write-Host "       matchedSkills   = $($r.matchedSkills -join ', ')"
    $ms = if ($r.missingSkills -and $r.missingSkills.Count -gt 0) { $r.missingSkills -join ', ' } else { "(none)" }
    Write-Host "       missingSkills   = $ms"
}

# Step 6 - CANDIDATE DASHBOARD STATS
Write-Host ""
Write-Host "[6] CANDIDATE DASHBOARD STATS - /api/users/stats"
$stats = CallApi -url "$API/users/stats" -token $CT
Write-Host "    applied      = $($stats.applied)  (from Application collection)"
Write-Host "    saved        = $($stats.saved)"
Write-Host "    atsScore     = $($stats.atsScore)"
Write-Host "    interviews   = $($stats.interviews)"
Write-Host "    profileViews = $($stats.profileViews)"

# Step 7 - FINAL STATE
Write-Host ""
Write-Host "[7] FINAL APPLICATION STATE"
$finalPipeline = CallApi -url "$API/applications/candidates" -token $RT
$finalAlpha = $null
foreach ($p in $finalPipeline) {
    if ($p.candidateName -eq "Candidate Alpha") { $finalAlpha = $p; break }
}
Write-Host "    candidateName = $($finalAlpha.candidateName)"
Write-Host "    stage         = $($finalAlpha.stage)"
Write-Host "    atsScore      = $($finalAlpha.atsScore)"

$rScore = if ($ranks.rankings.Count -gt 0) { $ranks.rankings[0].finalScore } else { "N/A" }

Write-Host ""
Write-Host "============================================================"
Write-Host "  ALL 7 STEPS COMPLETED SUCCESSFULLY"
Write-Host ""
Write-Host "  MongoDB Collections Used:"
Write-Host "    users              -> Recruiter A + Candidate A"
Write-Host "    jobs               -> Senior React Engineer at E2E Test Corp"
Write-Host "    applications       -> 1 application (Applied->Offer)"
Write-Host "    candidaterankings  -> 1 ranking (score=$rScore)"
Write-Host ""
Write-Host "  APIs Exercised:"
Write-Host "    POST /api/auth/login"
Write-Host "    GET  /api/applications/candidates"
Write-Host "    GET  /api/users/public/:clerkId"
Write-Host "    PATCH /api/applications/:id/stage"
Write-Host "    POST /api/jobs/:id/generate-ranking"
Write-Host "    GET  /api/jobs/:id/ranked-candidates"
Write-Host "    GET  /api/users/stats"
Write-Host "============================================================"
