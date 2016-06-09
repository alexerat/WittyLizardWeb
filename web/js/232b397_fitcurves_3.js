
function SmoothCurve(d)
{
	var i;
	var smoothed = [];

	smoothed[0] = {};
	smoothed[0].x = d[0].x;
	smoothed[0].y = d[0].y;
	smoothed[d.length - 1] = {};
	smoothed[d.length - 1].x = d[d.length - 1].x;
	smoothed[d.length - 1].y = d[d.length - 1].y;

	if(d.length < 3)
	{
		return smoothed;
	}

	smoothed[1] 	= {};
	smoothed[1].x 	= Math.round(0.27901 * d[0].x + 0.44198 * d[1].x + 0.27901 * d[2].x);
	smoothed[1].y 	= Math.round(0.27901 * d[0].y + 0.44198 * d[1].y + 0.27901 * d[2].y);

	if(d.length < 4)
	{
		return smoothed;
	}

	smoothed[d.length - 2] 	= {};
	smoothed[d.length - 2].x 	= Math.round(0.27901 * d[d.length - 3].x + 0.44198 * d[d.length - 2].x + 0.27901 * d[d.length - 1].x);
	smoothed[d.length - 2].y 	= Math.round(0.27901 * d[d.length - 3].y + 0.44198 * d[d.length - 2].y + 0.27901 * d[d.length - 1].y);

	if(d.length < 5)
	{
		return smoothed;
	}

	smoothed[2] 	= {};
	smoothed[2].x 	= Math.round(0.06136 * d[0].x + 0.24477 * d[1].x + 0.38774 * d[2].x + 0.24477 * d[3].x + 0.06136 * d[4].x);
	smoothed[2].y 	= Math.round(0.06136 * d[0].y + 0.24477 * d[1].y + 0.38774 * d[2].y + 0.24477 * d[3].y + 0.06136 * d[4].y);

	if(d.length < 6)
	{
		return smoothed;
	}

	smoothed[d.length - 3] 		= {};
	smoothed[d.length - 3].x 	= Math.round(0.06136 * d[d.length - 5].x + 0.24477 * d[d.length - 4].x + 0.38774 * d[d.length - 3].x + 0.24477 * d[d.length - 2].x + 0.06136 * d[d.length - 1].x);
	smoothed[d.length - 3].y 	= Math.round(0.06136 * d[d.length - 5].y + 0.24477 * d[d.length - 4].y + 0.38774 * d[d.length - 3].y + 0.24477 * d[d.length - 2].y + 0.06136 * d[d.length - 1].y);

	if(d.length < 7)
	{
		return smoothed;
	}

	for(i = 3; i < d.length - 3; i++)
	{
		smoothed[i] = {};
		smoothed[i].x 	= 0.383103 * d[i].x;
		smoothed[i].x 	= smoothed[i].x + 0.241843 * d[i - 1].x + 0.060626 * d[i - 2].x + 0.00598 * d[i - 3].x;
		smoothed[i].x 	= smoothed[i].x + 0.241843 * d[i + 1].x + 0.060626 * d[i + 2].x + 0.00598 * d[i + 3].x;
		smoothed[i].x	= Math.round(smoothed[i].x);
		smoothed[i].y 	= 0.383103 * d[i].y;
		smoothed[i].y 	= smoothed[i].y + 0.241843 * d[i - 1].y + 0.060626 * d[i - 2].y + 0.00598 * d[i - 3].y;
		smoothed[i].y 	= smoothed[i].y + 0.241843 * d[i + 1].y + 0.060626 * d[i + 2].y + 0.00598 * d[i + 3].y;
		smoothed[i].y	= Math.round(smoothed[i].y);
	}

    return smoothed;
}

function DeCluster(d, Rsqr)
{
	var i;
	var j;
	var reduced = [];
	var tmpVals;
	var prevPoint;
	var tmpVals;
	var avPoint;

	reduced[0] = {};
	reduced[0].x = d[0].x;
	reduced[0].y = d[0].y;

	i = 0;
	j = 0;
	prevPoint = 0;


	while(i < d.length)
	{

		while((Math.pow((reduced[reduced.length - 1].x - d[i].x), 2) + Math.pow((reduced[reduced.length - 1].y - d[i].y), 2)) < Rsqr && i < d.length - 1)
		{
			i++;
		}

		tmpVals = [];

		for(j = prevPoint; j < d.length && (j < i || (Math.pow((d[j].x - d[i].x), 2) + Math.pow((d[j].y - d[i].y), 2)) < Rsqr); j++)
		{
			if((Math.pow((d[j].x - d[i].x), 2) + Math.pow((d[j].y - d[i].y), 2)) < Rsqr)
			{
				tmpVals.push(d[j]);
			}
		}

		avPoint = {};
		avPoint.x = 0;
		avPoint.y = 0;

		for(j = 0; j < tmpVals.length; j++)
		{
			avPoint.x = avPoint.x + tmpVals[j].x;
			avPoint.y = avPoint.y + tmpVals[j].y;
		}

		avPoint.x = Math.round(avPoint.x / tmpVals.length);
		avPoint.y = Math.round(avPoint.y / tmpVals.length);

		if(avPoint.x != reduced[reduced.length - 1].x && avPoint.y != reduced[reduced.length - 1].y)
		{
			reduced[reduced.length] = {};
			reduced[reduced.length - 1].x = avPoint.x;
			reduced[reduced.length - 1].y = avPoint.y;
			prevPoint = i;
		}
		else
		{
			reduced[reduced.length] = {};
			reduced[reduced.length - 1].x = d[i].x;
			reduced[reduced.length - 1].y = d[i].y;
			prevPoint = i;
		}

		i++;
	}

	return reduced;
}

function findPerpendicularDistance(point, line)
{
    var pointX = point.x;
    var pointY = point.y;
    var lineStart = line[0];
    var lineEnd = line[1];
    var slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    var intercept = lineStart.y - (slope * lineStart.x);
    var result;

    result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);

    return result;
}

var bezierData = [];
var segcount;

function FitCurve(d, nPts, error)
{
	segcount = 0;
	bezierData = [];

	bezierData[0] = {};
	bezierData[0].x = d[0].x;
	bezierData[0].y = d[0].y;

    var leftTangent = ComputeLeftTangent(d, 0);
    var rightTangent = ComputeRightTangent(d, nPts - 1);

	var retVal = FitCubic(d, 0, nPts - 1, leftTangent, rightTangent, error);

	return bezierData;
}

/*
 *  FitCubic :
 *  	Fit a Bezier curve to a (sub)set of digitized points
 */
function FitCubic(d, first, last, leftTangent, rightTangent, error)
{
    var	bezCurve = [];		/* Control points of fitted Bezier curve*/
    var	u;					/* Parameter values for point  */
    var	uPrime;				/* Improved parameter values */
	var maxRet;
    var	maxError;			/* Maximum fitting error	 */
    var splitPoint;			/* Point to split point set at	 */
    var nPts;				/* Number of points in subset  */
    var	iterationError;		/* Error below which you try iterating  */
    var maxIterations = 4;	/* Max times to try iterating  */
    var tHatCenter;   		/* Unit tangent vector at splitPoint */
	var tHatLeft;
	var tHatRight;
    var i;

    iterationError = error * error;
    nPts = last - first + 1;

    /*  Use heuristic if region only has two points in it */
    if (nPts == 2)
	{
	    var dist = VDist(d[last], d[first]) / 3.0;

		bezCurve[0] = {};
		bezCurve[0].x = d[first].x;
		bezCurve[0].y = d[first].y;
		bezCurve[3] = {};
		bezCurve[3].x = d[last].x;
		bezCurve[3].y = d[last].y;
		bezCurve[2] = VAdd(bezCurve[3], VScale(rightTangent, dist));
		bezCurve[1] = VAdd(bezCurve[0], VScale(leftTangent, dist));


		bezierData[3 * segcount + 1] = {};
		bezierData[3 * segcount + 1].x = bezCurve[1].x;
		bezierData[3 * segcount + 1].y = bezCurve[1].y;
		bezierData[3 * segcount + 2] = {};
		bezierData[3 * segcount + 2].x = bezCurve[2].x;
		bezierData[3 * segcount + 2].y = bezCurve[2].y;
		bezierData[3 * segcount + 3] = {};
		bezierData[3 * segcount + 3].x = bezCurve[3].x;
		bezierData[3 * segcount + 3].y = bezCurve[3].y;
		segcount++;

		return;
    }

    /*  Parameterize points, and attempt to fit curve */
    u = ChordLengthParameterize(d, first, last);
    bezCurve = GenerateBezier(d, first, last, u, leftTangent, rightTangent);


    /*  Find max deviation of points to fitted curve */
    maxRet = ComputeMaxError(d, first, last, bezCurve, u, splitPoint);
	maxError = maxRet[0];
	splitPoint = maxRet[1];

	if (maxError < error)
	{
		bezierData[3 * segcount + 1] = {};
		bezierData[3 * segcount + 1].x = bezCurve[1].x;
		bezierData[3 * segcount + 1].y = bezCurve[1].y;
		bezierData[3 * segcount + 2] = {};
		bezierData[3 * segcount + 2].x = bezCurve[2].x;
		bezierData[3 * segcount + 2].y = bezCurve[2].y;
		bezierData[3 * segcount + 3] = {};
		bezierData[3 * segcount + 3].x = bezCurve[3].x;
		bezierData[3 * segcount + 3].y = bezCurve[3].y;
		segcount++;

		return;
    }

    /*  If error not too large, try some reparameterization  */
    /*  and iteration */
    if (maxError < iterationError)
	{
		for (i = 0; i < maxIterations; i++)
		{
	    	uPrime = Reparameterize(d, first, last, u, bezCurve);
	    	bezCurve = GenerateBezier(d, first, last, uPrime, leftTangent, rightTangent);
	    	maxRet = ComputeMaxError(d, first, last, bezCurve, uPrime, splitPoint);
			maxError = maxRet[0];
			splitPoint = maxRet[1];

	    	if (maxError < error)
			{
				bezierData[3 * segcount + 1] = {};
				bezierData[3 * segcount + 1].x = bezCurve[1].x;
				bezierData[3 * segcount + 1].y = bezCurve[1].y;
				bezierData[3 * segcount + 2] = {};
				bezierData[3 * segcount + 2].x = bezCurve[2].x;
				bezierData[3 * segcount + 2].y = bezCurve[2].y;
				bezierData[3 * segcount + 3] = {};
				bezierData[3 * segcount + 3].x = bezCurve[3].x;
				bezierData[3 * segcount + 3].y = bezCurve[3].y;
				segcount++;

				return;
			}

			u = uPrime;
		}
	}

	var splitarr = [];
	var i;
	var c;
	var dist;
	var mdist;
	var best;
	var dx;
	var dy;

	for (i = first; i < last; i ++)
	{
		c = 0;
		dx = d[i].x - d[i + 1].x;
		dy = d[i].y - d[i + 1].y;

		if (dx < 0.0)
		{
			c |= 1;
		}
		else if (dx > 0.0)
		{
			c |= 2;
		}

		if (dy < 0.0)
		{
			c |= 4;
		}
		else if (dy > 0.0)
		{
			c |= 8;
		}

		splitarr[i - first] = c;
	}

	/* zoek naar omslagpunten */
	for (i = 0; i < nPts - 1; i++)
	{
		splitarr[i] ^= splitarr[i + 1];
	}

	best = splitPoint;
	mdist = 0xffffff;

	/* eventueel nog optimaliseren naar meerdere omslagen na elkaar ?? */
	for (i = 1; i < nPts - 3; i++)
	{
		if (splitarr[i])
		{
			dist = (i + first + 1) - splitPoint;

			if (dist < 0) dist = -dist;

			if (dist < mdist)
			{
				best = i + first + 1;
				mdist = dist;
			}
		}
	}

	splitPoint = best;

    var tangents = ComputeCenterTangent_oud(d, splitPoint);
	tHatLeft = {};
	tHatLeft.x = tangents[0].x;
	tHatLeft.y = tangents[0].y;
	tHatRight = {};
	tHatRight.x = tangents[1].x;
	tHatRight.y = tangents[1].y;

    FitCubic(d, first, splitPoint, leftTangent, tHatLeft, error);
    FitCubic(d, splitPoint, last, tHatRight, rightTangent, error);

	return;
}

/*
 *  GenerateBezier :
 *  Use least-squares method to find Bezier control points for region.
 */
function GenerateBezier(d, first, last, uPrime, tHat1, tHat2)
{
    var i;
    var A = [];					/* Precomputed rhs for eqn	*/
    var nPts;					/* Number of pts in sub-curve */
    var	C = [];					/* Matrix C		*/
    var	X = [];					/* Matrix X			*/
    var	det_C0_C1;				/* Determinants of matrices	*/
	var det_C0_X;
	var det_X_C1;
    var alpha_l;				/* Alpha values, left and right	*/
	var alpha_r;
    var tmp;					/* Utility variable		*/
    var	bezCurve = [];			/* RETURN bezier curve ctl pts	*/

    nPts = last - first + 1;

    /* Compute the A's	*/
    for (i = 0; i < nPts; i++)
	{
		var	v1;
		var v2;
		A[i] = [];

		v1 = tHat1;
		v2 = tHat2;
		v1 = VScale(v1, B1(uPrime[i]));
		v2 = VScale(v2, B2(uPrime[i]));
		A[i][0] = v1;
		A[i][1] = v2;
    }

    /* Create the C and X matrices	*/
	C[0] = [];
	C[1] = [];
    C[0][0] = 0.0;
	C[0][1] = 0.0;
	C[1][0] = 0.0;
	C[1][1] = 0.0;
    X[0]    = 0.0;
	X[1]    = 0.0;

    for (i = 0; i < nPts; i++)
	{
        C[0][0] += VDot(A[i][0], A[i][0]);
		C[0][1] += VDot(A[i][0], A[i][1]);
		C[1][0] = C[0][1];
		C[1][1] += VDot(A[i][1], A[i][1]);

		var tmp1 = VScale(d[last], B3(uPrime[i]));
		var tmp2 = VScale(d[last], B2(uPrime[i]));
		var tmp3 = VScale(d[first], B1(uPrime[i]));
		var tmp4 = VScale(d[first], B0(uPrime[i]));
		var tmp5 = VAdd(tmp2, tmp1);
		var tmp6 = VAdd(tmp3, tmp5);
		var tmp7 = VAdd(tmp4, tmp6);

		tmp = VSub(d[first + i], tmp7);

		X[0] += VDot(A[i][0], tmp);
		X[1] += VDot(A[i][1], tmp);
    }

    /* Compute the determinants of C and X	*/
    det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
    det_C0_X  = C[0][0] * X[1]    - C[0][1] * X[0];
    det_X_C1  = X[0]    * C[1][1] - X[1]    * C[0][1];

    /* Finally, derive alpha values	*/
    if (det_C0_C1 == 0.0)
	{
		det_C0_C1 = (C[0][0] * C[1][1]) * 10e-12;
    }

	alpha_l = det_X_C1 / det_C0_C1;
	alpha_r = det_C0_X / det_C0_C1;

    /*  If alpha negative, use the Wu/Barsky heuristic (see text) */
    if (alpha_l < 0.0 || alpha_r < 0.0)
	{
		var dist = VDist(d[last], d[first]) / 3.0;

		bezCurve[0] = {};
		bezCurve[0].x = d[first].x;
		bezCurve[0].y = d[first].y;
		bezCurve[3] = {};
		bezCurve[3].x = d[last].x;
		bezCurve[3].y = d[last].y;
		bezCurve[2] = VAdd(bezCurve[3], VScale(tHat2, dist));
		bezCurve[1] = VAdd(bezCurve[0], VScale(tHat1, dist));

		return bezCurve;
    }

    /*  First and last control points of the Bezier curve are */
    /*  positioned exactly at the first and last data points */
    /*  Control points 1 and 2 are positioned an alpha distance out */
    /*  on the tangent vectors, left and right, respectively */
	bezCurve[0] = {};
	bezCurve[0].x = d[first].x;
	bezCurve[0].y = d[first].y;
	bezCurve[3] = {};
	bezCurve[3].x = d[last].x;
	bezCurve[3].y = d[last].y;
    bezCurve[2] = VAdd(bezCurve[3], VScale(tHat2, alpha_r));
	bezCurve[1] = VAdd(bezCurve[0], VScale(tHat1, alpha_l));

    return bezCurve;
}


/*
 *  Reparameterize:
 *	Given set of points and their parameterization, try to find
 *   a better parameterization.
 */
function Reparameterize(d, first, last, u, bezCurve)
{
    var i;
    var	uPrime = [];		/*  New parameter values	*/

    for (i = first; i <= last; i++)
	{
		uPrime[i-first] = NewtonRaphsonRootFind(bezCurve, d[i], u[i - first]);
    }

    return uPrime;
}


/*
 *  NewtonRaphsonRootFind :
 *	Use Newton-Raphson iteration to find better root.
 */
function NewtonRaphsonRootFind(Q, P, u)
{
    var numerator;
	var denominator;
    var Q1 = []; // Q'
	var Q2 = [];	// Q''
    var	Q_u;
	var Q1_u;
	var Q2_u; /*u evaluated at Q, Q', & Q''	*/
    var	uPrime;		/*  Improved u			*/
    var i;

    /* Compute Q(u)	*/
    Q_u = Bezier(3, Q, u);

    /* Generate control vertices for Q'	*/
    for (i = 0; i <= 2; i++)
	{
		Q1[i] = {};
		Q1[i].x = (Q[i+1].x - Q[i].x) * 3.0;
		Q1[i].y = (Q[i+1].y - Q[i].y) * 3.0;
    }

    /* Generate control vertices for Q'' */
    for (i = 0; i <= 1; i++)
	{
		Q2[i] = {};
		Q2[i].x = (Q1[i+1].x - Q1[i].x) * 2.0;
		Q2[i].y = (Q1[i+1].y - Q1[i].y) * 2.0;
    }

    /* Compute Q'(u) and Q''(u)	*/
    Q1_u = Bezier(2, Q1, u);
    Q2_u = Bezier(1, Q2, u);

    /* Compute f(u)/f'(u) */
    numerator = (Q_u.x - P.x) * (Q1_u.x) + (Q_u.y - P.y) * (Q1_u.y);
    denominator = (Q1_u.x) * (Q1_u.x) + (Q1_u.y) * (Q1_u.y) + (Q_u.x - P.x) * (Q2_u.x) + (Q_u.y - P.y) * (Q2_u.y);

    /* u = u - f(u)/f'(u) */
    uPrime = u - (numerator / denominator);

    return uPrime;
}


/*
 *  Bezier :
 *  	Evaluate a Bezier curve at a particular parameter value
 */
function Bezier(degree, V, t)
{
    var i;
	var j;
    var Q;	        	/* Point on curve at parameter t	*/
    var Vtemp = [];		/* Local copy of control points		*/

    for (i = 0; i <= degree; i++)
	{
		Vtemp[i] = {};
		Vtemp[i].x = V[i].x;
		Vtemp[i].y = V[i].y;
    }

    /* Triangle computation	*/
    for (i = 1; i <= degree; i++)
	{
		for (j = 0; j <= degree-i; j++)
		{
	    	Vtemp[j].x = (1.0 - t) * Vtemp[j].x + t * Vtemp[j + 1].x;
	    	Vtemp[j].y = (1.0 - t) * Vtemp[j].y + t * Vtemp[j + 1].y;
		}
    }

    Q = Vtemp[0];

    return Q;
}

/*
 *  B0, B1, B2, B3 :
 *	Bezier multipliers
 */
function B0(u)
{
    var tmp = 1.0 - u;
    return (tmp * tmp * tmp);
}


function B1(u)
{
    var tmp = 1.0 - u;
    return (3 * u * (tmp * tmp));
}

function B2(u)
{
    var tmp = 1.0 - u;
    return (3 * u * u * tmp);
}

function B3(u)
{
    return (u * u * u);
}

/*
 * ComputeLeftTangent, ComputeRightTangent, ComputeCenterTangent :
 *Approximate unit tangents at endpoints and "center" of digitized curve
 */
function ComputeLeftTangent(d, end)
{
    var	tHat1;

    tHat1 = VSub(d[end + 1], d[end]);
    tHat1 = VNorm(tHat1);

    return tHat1;
}

function ComputeRightTangent(d, end)
{
    var tHat2;

    tHat2 = VSub(d[end - 1], d[end]);
    tHat2 = VNorm(tHat2);

    return tHat2;
}


function ComputeCenterTangent_oud(d, center)
{
    var	VL;
	var VR;
	var tHatCenter = {};
	var tHatR = {};
	var tHatL = {};

    VL = VSub(d[center - 1], d[center]);
    VR = VSub(d[center], d[center + 1]);
	VL = VNorm(VL);
	VR = VNorm(VR);

	if (VDot(VL, VR) < -0.7)
	{
		return [VL, VR];
	}

    tHatCenter.x = VL.x + VR.x;
    tHatCenter.y = VL.y + VR.y;

	tHatCenter = VNorm(tHatCenter);
	tHatL = {};
	tHatL.x = tHatCenter.x;
	tHatL.y = tHatCenter.y;
	tHatR = {};
	tHatR.x = -tHatCenter.x;
	tHatR.y = -tHatCenter.y;

    return [tHatL, tHatR];
}

/*
 *  ChordLengthParameterize :
 *	Assign parameter values to digitized points
 *	using relative distances between points.
 */
function ChordLengthParameterize(d, first, last)
{
    var	i;
    var u = [];			/*  Parameterization		*/

    u[0] = 0.0;

    for (i = first + 1; i <= last; i++)
	{
		u[i - first] = u[i - first - 1] + VDist(d[i], d[i - 1]);
    }

    for (i = first + 1; i <= last; i++)
	{
		u[i - first] = u[i - first] / u[last - first];
    }

    return u;
}

/*
 *  ComputeMaxError :
 *	Find the maximum squared distance of digitized points
 *	to fitted curve.
*/
function ComputeMaxError(d, first, last, bezCurve, u)
{
    var	i;
    var	maxDist;				/*  Maximum error		*/
    var	dist;					/*  Current error		*/
    var	P;						/*  Point on curve		*/
    var	v;						/*  Vector from point to curve	*/
	var splitPoint;

    splitPoint = (last - first + 1) / 2;

	maxDist = 0.0;

    for (i = first + 1; i < last; i++)
	{
		P = Bezier(3, bezCurve, u[i - first]);
		v = VSub(P, d[i]);
		dist = VSquaredLength(v);

		if (dist >= maxDist)
		{
	    	maxDist = dist;
	    	splitPoint = i;
		}
    }

    return [maxDist, splitPoint];
}

function VAdd(a, b)
{
    var	c = {};

    c.x = a.x + b.x;
	c.y = a.y + b.y;

	return c;
}

function VScale(v, s)
{
    var result = {};

	result.x = v.x * s;
	result.y = v.y * s;

	return result;
}

function VSub(a, b)
{
    var	c = {};

    c.x = a.x - b.x;
	c.y = a.y - b.y;

    return c;
}

function VSquaredLength(v)
{
	var lSqr = Math.pow(v.x, 2) + Math.pow(v.y, 2);

	return lSqr;
}

function VDist(v1, v2)
{
	var dist = Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));

	return dist;
}

function VNorm(v)
{
	var retV = {};
	var len = 1 / Math.sqrt(VSquaredLength(v));

	retV.x = len * v.x;
	retV.y = len * v.y;

	return retV;
}

function VDot(v1, v2)
{
	return (v1.x * v2.x + v1.y * v2.y);
}
