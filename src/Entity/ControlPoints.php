<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ControlPoints
 *
 * @ORM\Table(name="Online_Comms.Control_Points")
 * @ORM\Entity
 */
class ControlPoints
{
    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\WhiteboardSpace")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Entry_ID", referencedColumnName="Entry_ID")
     * })
    */
    private $entryId;

    /**
     * @var int
     *
     * @ORM\Column(name="Seq_Num", type="integer")
     * @ORM\Id
    */
    private $seqNum;

    /**
     * @var int
     *
     * @ORM\Column(name="X_Loc", type="integer")
    */
    private $xLoc;

    /**
     * @var string
     *
     * @ORM\Column(name="Y_Loc", type="integer")
     */
    private $yLoc;

    /**
     * Set seqNum
     *
     * @param integer $seqNum
     *
     * @return ControlPoints
     */
    public function setSeqNum($seqNum)
    {
        $this->seqNum = $seqNum;

        return $this;
    }

    /**
     * Get seqNum
     *
     * @return integer
     */
    public function getSeqNum()
    {
        return $this->seqNum;
    }

    /**
     * Set xLoc
     *
     * @param integer $xLoc
     *
     * @return ControlPoints
     */
    public function setXLoc($xLoc)
    {
        $this->xLoc = $xLoc;

        return $this;
    }

    /**
     * Get xLoc
     *
     * @return integer
     */
    public function getXLoc()
    {
        return $this->xLoc;
    }

    /**
     * Set yLoc
     *
     * @param integer $yLoc
     *
     * @return ControlPoints
     */
    public function setYLoc($yLoc)
    {
        $this->yLoc = $yLoc;

        return $this;
    }

    /**
     * Get yLoc
     *
     * @return integer
     */
    public function getYLoc()
    {
        return $this->yLoc;
    }

    /**
     * Set entryId
     *
     * @param \App\Entity\WhiteboardSpace $entryId
     *
     * @return ControlPoints
     */
    public function setEntryId(\App\Entity\WhiteboardSpace $entryId = null)
    {
        $this->entryId = $entryId;

        return $this;
    }

    /**
     * Get entryId
     *
     * @return \App\Entity\WhiteboardSpace
     */
    public function getEntryId()
    {
        return $this->entryId;
    }
}
